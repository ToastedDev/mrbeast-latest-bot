interface SendMessageParams {
  content?: string;
  embeds?: {
    title?: string;
    description?: string;
    url?: string;
    author?: {
      name: string;
      url?: string;
      iconUrl?: string;
    };
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
    thumbnailUrl?: string;
    imageUrl?: string;
    color?: string;
    timestamp?: string;
  }[];
}

function hexToDecimalColor(hexString: string) {
  // Ensure the hex string starts with a hash (#) and remove it
  if (hexString.startsWith("#")) {
    hexString = hexString.slice(1);
  }

  // Validate the remaining string is a valid 6-digit hexadecimal
  if (typeof hexString !== "string" || !/^[0-9a-fA-F]{6}$/.test(hexString)) {
    throw new Error("Invalid hexadecimal color string");
  }

  // Convert the hexadecimal string to a decimal number
  const decimalValue = parseInt(hexString, 16);

  return decimalValue;
}

export function sendMessage(params: SendMessageParams) {
  return fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: params.content,
      embeds: params.embeds?.map((embed) => ({
        title: embed.title,
        description: embed.description,
        url: embed.url,
        author: embed.author
          ? {
              name: embed.author.name,
              url: embed.author.url,
              icon_url: embed.author.iconUrl,
            }
          : undefined,
        fields: embed.fields,
        thumbnail: embed.thumbnailUrl
          ? {
              url: embed.thumbnailUrl,
            }
          : undefined,
        image: embed.imageUrl
          ? {
              url: embed.imageUrl,
            }
          : undefined,
        color: embed.color ? hexToDecimalColor(embed.color) : undefined,
        timestamp: embed.timestamp,
      })),
    }),
  });
}
