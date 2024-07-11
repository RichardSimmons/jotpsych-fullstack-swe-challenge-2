class APIService {
  private static instance: APIService;
  private baseUrl: string = "http://localhost:3002";
  private appVersion: string = "1.2.0";

  private constructor() {}

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  public async request(
    endpoint: string,
    method: string,
    body?: any,
    auth: boolean = false
  ): Promise<any> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "app-version": this.appVersion,
    };

    if (auth) {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      if (response.status === 426) { // 426 Upgrade Required
        const errorData = await response.json();
        throw new Error(errorData.message || "Please update your client application.");
      }
      throw new Error("Network response was not ok");
    }

    return response.json();
  }
}

export default APIService.getInstance();