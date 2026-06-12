const TRELLO_BASE = "https://api.trello.com/1";

const CARD_FIELDS = [
  "id",
  "idShort",
  "name",
  "desc",
  "descData",
  "url",
  "shortUrl",
  "shortLink",
  "idBoard",
  "idList",
  "labels",
  "due",
  "dueReminder",
  "dueComplete",
  "start",
  "closed",
  "subscribed",
  "pos",
  "dateLastActivity",
  "dateClosed",
  "badges",
  "cover",
  "idMembers",
  "idMembersVoted",
  "manualCoverAttachment",
  "isTemplate",
  "cardRole",
  "email",
  "coordinates",
  "address",
].join(",");

const CARD_EMBEDS =
  "members=true&member_fields=fullName,username,initials,avatarUrl&memberVoted_fields=fullName,username&checklists=all&checkItemStates=true&stickers=true&customFieldItems=true";

export class TrelloClient {
  constructor({ apiKey, token }) {
    this.apiKey = apiKey;
    this.token = token;
  }

  authQuery() {
    return `key=${encodeURIComponent(this.apiKey)}&token=${encodeURIComponent(this.token)}`;
  }

  async request(path, options = {}) {
    const separator = path.includes("?") ? "&" : "?";
    const url = `${TRELLO_BASE}${path}${separator}${this.authQuery()}`;
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Trello API ${response.status}: ${text}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  async getMe() {
    return this.request("/members/me?fields=fullName,username,url");
  }

  async getMyCards() {
    return this.request(
      `/members/me/cards?fields=${CARD_FIELDS}&${CARD_EMBEDS}`
    );
  }

  /** @deprecated Use getCardFull — kept for internal compatibility */
  async getCard(cardId) {
    return this.getCardFull(cardId);
  }

  async getCardRaw(cardId) {
    return this.request(`/cards/${cardId}?fields=${CARD_FIELDS}&${CARD_EMBEDS}`);
  }

  async getCardComments(cardId, limit = 1000) {
    const actions = await this.request(
      `/cards/${cardId}/actions?filter=commentCard&limit=${limit}`
    );
    return actions.map((action) => this.formatComment(action));
  }

  async getCardAttachments(cardId) {
    const attachments = await this.request(
      `/cards/${cardId}/attachments?fields=all`
    );
    return attachments.map((att) => ({
      id: att.id,
      name: att.name,
      url: att.url,
      mimeType: att.mimeType,
      bytes: att.bytes,
      date: att.date,
      isUpload: att.isUpload,
      previews: att.previews,
    }));
  }

  async getCardActivity(cardId, limit = 100) {
    const actions = await this.request(
      `/cards/${cardId}/actions?filter=commentCard,updateCard,addAttachmentToCard,createCard,copyCard,addMemberToCard,removeMemberFromCard,addChecklistToCard,updateCheckItemStateOnCard&limit=${limit}`
    );
    return actions.map((action) => ({
      id: action.id,
      type: action.type,
      date: action.date,
      author: action.memberCreator?.fullName || action.memberCreator?.username,
      data: action.data,
    }));
  }

  async getBoardCustomFields(boardId) {
    try {
      return await this.request(`/boards/${boardId}/customFields`);
    } catch {
      return [];
    }
  }

  async getCardFull(cardId) {
    const card = await this.getCardRaw(cardId);

    const [comments, attachments, activity, list, board, customFieldDefs] =
      await Promise.all([
        this.getCardComments(cardId),
        this.getCardAttachments(cardId),
        this.getCardActivity(cardId),
        this.request(`/lists/${card.idList}?fields=id,name,pos,closed`),
        this.request(
          `/boards/${card.idBoard}?fields=id,name,url,shortUrl,desc,prefs,labelNames`
        ),
        this.getBoardCustomFields(card.idBoard),
      ]);

    return this.formatCardFull(card, {
      comments,
      attachments,
      activity,
      list,
      board,
      customFieldDefs,
    });
  }

  async addComment(cardId, text) {
    return this.request(
      `/cards/${cardId}/actions/comments?text=${encodeURIComponent(text)}`,
      { method: "POST" }
    );
  }

  async updateCard(cardId, data) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    return this.request(`/cards/${cardId}?${params.toString()}`, {
      method: "PUT",
    });
  }

  async moveCard(cardId, listId) {
    return this.updateCard(cardId, { idList: listId });
  }

  async attachUrl(cardId, url, name = "Commit") {
    const params = new URLSearchParams({ url, name });
    return this.request(`/cards/${cardId}/attachments?${params.toString()}`, {
      method: "POST",
    });
  }

  async getBoardLists(boardId) {
    return this.request(`/boards/${boardId}/lists?fields=id,name,pos,closed`);
  }

  async getBoardCards(boardId) {
    const [lists, cards] = await Promise.all([
      this.getBoardLists(boardId),
      this.request(
        `/boards/${boardId}/cards?fields=${CARD_FIELDS}&members=true&member_fields=fullName,username&checklists=all`
      ),
    ]);
    const listNames = Object.fromEntries(lists.map((l) => [l.id, l.name]));
    return cards.map((card) => this.formatCardBrief(card, listNames));
  }

  async getBoards() {
    return this.request(
      "/members/me/boards?fields=id,name,url,shortUrl&filter=open"
    );
  }

  formatComment(action) {
    return {
      id: action.id,
      date: action.date,
      author: action.memberCreator?.fullName || action.memberCreator?.username,
      text: action.data?.text || "",
    };
  }

  formatLabels(labels = []) {
    return labels.map((l) => ({
      id: l.id,
      name: l.name || null,
      color: l.color,
    }));
  }

  formatChecklists(checklists = []) {
    return checklists.map((cl) => ({
      id: cl.id,
      name: cl.name,
      pos: cl.pos,
      items: (cl.checkItems || []).map((item) => ({
        id: item.id,
        name: item.name,
        state: item.state,
        pos: item.pos,
        due: item.due || null,
        idMember: item.idMember || null,
      })),
    }));
  }

  formatCustomFields(customFieldItems = [], customFieldDefs = []) {
    const defsById = Object.fromEntries(
      (customFieldDefs || []).map((f) => [f.id, f])
    );
    return (customFieldItems || []).map((item) => {
      const def = defsById[item.idCustomField] || {};
      let value = null;
      if (item.value?.text) value = item.value.text;
      else if (item.value?.number != null) value = item.value.number;
      else if (item.value?.date) value = item.value.date;
      else if (item.value?.checked != null) value = item.value.checked;
      else if (item.idValue) {
        const option = (def.options || []).find((o) => o.id === item.idValue);
        value = option?.value?.text || item.idValue;
      }
      return {
        id: item.id,
        fieldId: item.idCustomField,
        name: def.name || item.idCustomField,
        type: def.type || null,
        value,
      };
    });
  }

  formatCardBrief(card, listNames = {}) {
    return {
      id: card.id,
      idShort: card.idShort,
      name: card.name,
      desc: card.desc || "",
      list: listNames[card.idList] || card.idList,
      listId: card.idList,
      boardId: card.idBoard,
      url: card.shortUrl,
      labels: this.formatLabels(card.labels),
      due: card.due,
      dueComplete: card.dueComplete,
      members: (card.members || []).map((m) => m.fullName || m.username),
      checklists: this.formatChecklists(card.checklists),
      badges: card.badges || null,
      lastActivity: card.dateLastActivity,
    };
  }

  formatCardFull(card, extras = {}) {
    const {
      comments = [],
      attachments = [],
      activity = [],
      list = null,
      board = null,
      customFieldDefs = [],
    } = extras;

    const createAction = activity.find((a) => a.type === "createCard");

    return {
      id: card.id,
      idShort: card.idShort,
      name: card.name,
      desc: card.desc || "",
      descData: card.descData || null,
      url: card.url,
      shortUrl: card.shortUrl,
      shortLink: card.shortLink,
      board: board
        ? { id: board.id, name: board.name, url: board.url, shortUrl: board.shortUrl }
        : { id: card.idBoard },
      list: list
        ? { id: list.id, name: list.name, pos: list.pos, closed: list.closed }
        : { id: card.idList },
      status: {
        closed: card.closed,
        subscribed: card.subscribed,
        dueComplete: card.dueComplete,
        isTemplate: card.isTemplate,
        cardRole: card.cardRole || null,
      },
      dates: {
        due: card.due,
        dueReminder: card.dueReminder,
        start: card.start || null,
        lastActivity: card.dateLastActivity,
        dateClosed: card.dateClosed || null,
        created: createAction?.date || null,
      },
      position: card.pos,
      cover: card.cover || null,
      labels: this.formatLabels(card.labels),
      members: (card.members || []).map((m) => ({
        id: m.id,
        fullName: m.fullName,
        username: m.username,
      })),
      membersVoted: (card.membersVoted || []).map((m) => ({
        id: m.id,
        fullName: m.fullName,
        username: m.username,
      })),
      badges: card.badges || null,
      checklists: this.formatChecklists(card.checklists),
      comments,
      attachments,
      stickers: (card.stickers || []).map((s) => ({
        id: s.id,
        top: s.top,
        left: s.left,
        zIndex: s.zIndex,
        image: s.image,
        imageUrl: s.imageUrl,
      })),
      customFields: this.formatCustomFields(
        card.customFieldItems,
        customFieldDefs
      ),
      activity,
      location: {
        address: card.address || null,
        coordinates: card.coordinates || null,
      },
      email: card.email || null,
    };
  }

  /** @deprecated Use formatCardFull via getCardFull */
  formatCardSummary(card) {
    return this.formatCardFull(card, {
      comments: (card.actions || [])
        .filter((a) => a.type === "commentCard")
        .map((a) => this.formatComment(a)),
      attachments: [],
      activity: [],
      list: null,
      board: null,
      customFieldDefs: [],
    });
  }
}
