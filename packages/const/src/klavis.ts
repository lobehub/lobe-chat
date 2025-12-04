import { IconType, SiCaldotcom, SiGithub, SiLinear } from '@icons-pack/react-simple-icons';
import { Klavis } from 'klavis';

export interface KlavisServerType {
  icon: string | IconType;
  id: Klavis.McpServerName;
  label: string;
}

export const KLAVIS_SERVER_TYPES: KlavisServerType[] = [
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/gmail.svg',
    id: Klavis.McpServerName.Gmail,
    label: 'Gmail',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googlecalendar.svg',
    id: Klavis.McpServerName.GoogleCalendar,
    label: 'Google Calendar',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/notion.svg',
    id: Klavis.McpServerName.Notion,
    label: 'Notion',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/airtable.svg',
    id: Klavis.McpServerName.Airtable,
    label: 'Airtable',
  },
  {
    icon: SiLinear,
    id: Klavis.McpServerName.Linear,
    label: 'Linear',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googlesheets.svg',
    id: Klavis.McpServerName.GoogleSheets,
    label: 'Google Sheets',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googledocs.svg',
    id: Klavis.McpServerName.GoogleDocs,
    label: 'Google Docs',
  },
  {
    icon: SiGithub,
    id: Klavis.McpServerName.Github,
    label: 'GitHub',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/supabase.svg',
    id: Klavis.McpServerName.Supabase,
    label: 'Supabase',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googledrive.svg',
    id: Klavis.McpServerName.GoogleDrive,
    label: 'Google Drive',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/slack.svg',
    id: Klavis.McpServerName.Slack,
    label: 'Slack',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/confluence.svg',
    id: Klavis.McpServerName.Confluence,
    label: 'Confluence',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/jira.svg',
    id: Klavis.McpServerName.Jira,
    label: 'Jira',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/clickup.svg',
    id: Klavis.McpServerName.Clickup,
    label: 'ClickUp',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/dropbox.svg',
    id: Klavis.McpServerName.Dropbox,
    label: 'Dropbox',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/figma.svg',
    id: Klavis.McpServerName.Figma,
    label: 'Figma',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/hubspot.svg',
    id: Klavis.McpServerName.Hubspot,
    label: 'HubSpot',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/onedrive.svg',
    id: Klavis.McpServerName.Onedrive,
    label: 'OneDrive',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/outlook.svg',
    id: Klavis.McpServerName.OutlookMail,
    label: 'Outlook Mail',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/salesforce.svg',
    id: Klavis.McpServerName.Salesforce,
    label: 'Salesforce',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/whatsapp.svg',
    id: Klavis.McpServerName.Whatsapp,
    label: 'WhatsApp',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/youtube.svg',
    id: Klavis.McpServerName.Youtube,
    label: 'YouTube',
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/zendesk.svg',
    id: Klavis.McpServerName.Zendesk,
    label: 'Zendesk',
  },
  {
    icon: SiCaldotcom,
    id: Klavis.McpServerName.CalCom,
    label: 'Cal.com',
  },
];
