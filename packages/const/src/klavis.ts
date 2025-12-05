import { IconType, SiCaldotcom, SiGithub, SiLinear } from '@icons-pack/react-simple-icons';
import { Klavis } from 'klavis';

export interface KlavisServerType {
  icon: string | IconType;
  /**
   * Identifier used for storage in database (e.g., 'google-calendar')
   * Format: lowercase, spaces replaced with hyphens
   */
  identifier: string;
  label: string;
  /**
   * Server name used to call Klavis API (e.g., 'Google Calendar')
   */
  serverName: Klavis.McpServerName;
}

/**
 * Helper to generate identifier from label
 * Converts "Google Calendar" to "google-calendar"
 */
const toIdentifier = (label: string): string => label.toLowerCase().replaceAll(' ', '-');

export const KLAVIS_SERVER_TYPES: KlavisServerType[] = [
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/gmail.svg',
    identifier: toIdentifier('Gmail'),
    label: 'Gmail',
    serverName: Klavis.McpServerName.Gmail,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googlecalendar.svg',
    identifier: toIdentifier('Google Calendar'),
    label: 'Google Calendar',
    serverName: Klavis.McpServerName.GoogleCalendar,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/notion.svg',
    identifier: toIdentifier('Notion'),
    label: 'Notion',
    serverName: Klavis.McpServerName.Notion,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/airtable.svg',
    identifier: toIdentifier('Airtable'),
    label: 'Airtable',
    serverName: Klavis.McpServerName.Airtable,
  },
  {
    icon: SiLinear,
    identifier: toIdentifier('Linear'),
    label: 'Linear',
    serverName: Klavis.McpServerName.Linear,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googlesheets.svg',
    identifier: toIdentifier('Google Sheets'),
    label: 'Google Sheets',
    serverName: Klavis.McpServerName.GoogleSheets,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googledocs.svg',
    identifier: toIdentifier('Google Docs'),
    label: 'Google Docs',
    serverName: Klavis.McpServerName.GoogleDocs,
  },
  {
    icon: SiGithub,
    identifier: toIdentifier('GitHub'),
    label: 'GitHub',
    serverName: Klavis.McpServerName.Github,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/supabase.svg',
    identifier: toIdentifier('Supabase'),
    label: 'Supabase',
    serverName: Klavis.McpServerName.Supabase,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/googledrive.svg',
    identifier: toIdentifier('Google Drive'),
    label: 'Google Drive',
    serverName: Klavis.McpServerName.GoogleDrive,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/slack.svg',
    identifier: toIdentifier('Slack'),
    label: 'Slack',
    serverName: Klavis.McpServerName.Slack,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/confluence.svg',
    identifier: toIdentifier('Confluence'),
    label: 'Confluence',
    serverName: Klavis.McpServerName.Confluence,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/jira.svg',
    identifier: toIdentifier('Jira'),
    label: 'Jira',
    serverName: Klavis.McpServerName.Jira,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/clickup.svg',
    identifier: toIdentifier('ClickUp'),
    label: 'ClickUp',
    serverName: Klavis.McpServerName.Clickup,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/dropbox.svg',
    identifier: toIdentifier('Dropbox'),
    label: 'Dropbox',
    serverName: Klavis.McpServerName.Dropbox,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/figma.svg',
    identifier: toIdentifier('Figma'),
    label: 'Figma',
    serverName: Klavis.McpServerName.Figma,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/hubspot.svg',
    identifier: toIdentifier('HubSpot'),
    label: 'HubSpot',
    serverName: Klavis.McpServerName.Hubspot,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/onedrive.svg',
    identifier: toIdentifier('OneDrive'),
    label: 'OneDrive',
    serverName: Klavis.McpServerName.Onedrive,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/outlook.svg',
    identifier: toIdentifier('Outlook Mail'),
    label: 'Outlook Mail',
    serverName: Klavis.McpServerName.OutlookMail,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/salesforce.svg',
    identifier: toIdentifier('Salesforce'),
    label: 'Salesforce',
    serverName: Klavis.McpServerName.Salesforce,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/whatsapp.svg',
    identifier: toIdentifier('WhatsApp'),
    label: 'WhatsApp',
    serverName: Klavis.McpServerName.Whatsapp,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/youtube.svg',
    identifier: toIdentifier('YouTube'),
    label: 'YouTube',
    serverName: Klavis.McpServerName.Youtube,
  },
  {
    icon: 'https://hub-apac-1.lobeobjects.space/assets/logos/zendesk.svg',
    identifier: toIdentifier('Zendesk'),
    label: 'Zendesk',
    serverName: Klavis.McpServerName.Zendesk,
  },
  {
    icon: SiCaldotcom,
    identifier: 'cal-com',
    label: 'Cal.com',
    serverName: Klavis.McpServerName.CalCom,
  },
];
