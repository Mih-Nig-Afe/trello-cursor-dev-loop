const TRELLO_BASE = "https://api.trello.com/1";

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
      "/members/me/cards?fields=id,name,desc,url,shortUrl,idList,idBoard,labels,due,dateLastActivity&members=true&checklists=all"
    );
  }

  async getCard(cardId) {
    return this.request(
      `/cards/${cardId}?fields=id,name,desc,url,shortUrl,idList,idBoard,labels,due,dateLastActivity&members=true&checklists=all&actions=commentCard&actions_limit=50`
    );
  }

  async getCardComments(cardId) {
    const actions = await this.request(
      `/cards/${cardId}/actions?filter=commentCard&limit=50`
    );
    return actions.map((action) => ({
      id: action.id,
      date: action.date,
      author: action.memberCreator?.fullName || action.memberCreator?.username,
      text: action.data?.text || "",
    }));
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

  async getBoards() {
    return this.request(
      "/members/me/boards?fields=id,name,url,shortUrl&filter=open"
    );
  }

  formatCardSummary(card) {
    const checklists = (card.checklists || []).map((cl) => ({
      id: cl.id,
      name: cl.name,
      items: (cl.checkItems || []).map((item) => ({
        id: item.id,
        name: item.name,
        state: item.state,
      })),
    }));

    const comments = (card.actions || [])
      .filter((a) => a.type === "commentCard")
      .map((a) => ({
        date: a.date,
        author: a.memberCreator?.fullName || a.memberCreator?.username,
        text: a.data?.text || "",
      }));

    return {
      id: card.id,
      name: card.name,
      desc: card.desc || "",
      url: card.url,
      shortUrl: card.shortUrl,
      boardId: card.idBoard,
      listId: card.idList,
      labels: (card.labels || []).map((l) => l.name || l.color),
      due: card.due,
      lastActivity: card.dateLastActivity,
      members: (card.members || []).map((m) => m.fullName || m.username),
      checklists,
      comments,
    };
  }
}
