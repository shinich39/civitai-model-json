export type ModelResponse = {
  "items": Record<string, any>[],
  "metadata"?: {
    "nextCursor"?: string,
    "nextPage"?: string,
    "currentPage"?: number,
    "pageSize"?: number
  }
}

export type ImageResponse = Record<string, any>[];

export type ModelOptions = {
  limit: string,
  types: "Checkpoint"|"LORA",

  // query: "DreamShaper",
  query?: string,
  
  sort: "Newest"|"Highest Rated"|"Most Downloaded",

  period?: "AllTime"|"Year"|"Month"|"Week"|"Day",
};

export type ImageOptions = {
  modelId: number,
  modelVersionId: number,
  username: string,
} & Record<string, string>;

export function getModelURL(options: ModelOptions|string) {
  if (typeof options === "string") {
    return `https://civitai.com/api/v1/models/${options}`;
  } else {
    const params = new URLSearchParams(options);
    return "https://civitai.com/api/v1/models?"+params.toString();
  }
}

export function getImageURL(options: ImageOptions) {
  const params = new URLSearchParams(
    Object.assign(
      { limit: "100" }, 
      options
    )
  );

  return "https://civitai.com/api/v1/images?"+params.toString();
}

export async function getModel(url: string): Promise<Record<string, any>> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  return await res.json();
}

export async function getModels(url: string): Promise<ModelResponse> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  return await res.json();
}

export async function getImages(url: string): Promise<ImageResponse> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.items)) {
    throw new Error(`Failed to search image: ${url}`);
  }
  return data.items;
}