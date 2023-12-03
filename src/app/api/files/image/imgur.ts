import { getServerConfig } from '@/config/server';

interface UploadResponse {
  data: UploadData;
  status: number;
  success: boolean;
}

interface UploadData {
  account_id: any;
  account_url: any;
  ad_type: any;
  ad_url: any;
  animated: boolean;
  bandwidth: number;
  datetime: number;
  deletehash: string;
  description: any;
  favorite: boolean;
  has_sound: boolean;
  height: number;
  hls: string;
  id: string;
  in_gallery: boolean;
  in_most_viral: boolean;
  is_ad: boolean;
  link: string;
  mp4: string;
  name: string;
  nsfw: any;
  section: any;
  size: number;
  tags: any[];
  title: any;
  type: string;
  views: number;
  vote: any;
  width: number;
}

export class Imgur {
  clientId: string;
  api = 'https://api.imgur.com/3';

  constructor() {
    this.clientId = getServerConfig().IMGUR_CLIENT_ID;
  }

  async upload(image: Blob) {
    const formData = new FormData();

    formData.append('image', image, 'image.png');

    const res = await fetch(`${this.api}/upload`, {
      body: formData,
      headers: {
        Authorization: `Client-ID ${this.clientId}`,
      },
      method: 'POST',
    });

    if (!res.ok) {
      console.log(await res.text());
    }

    const data: UploadResponse = await res.json();
    if (data.success) {
      return data.data.link;
    }
    return undefined;
  }
}
