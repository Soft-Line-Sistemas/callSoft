export interface MenuOption {
  id: string;
  trigger: string;
  label: string;
  action: 'message' | 'link' | 'transfer';
  response: string;
}

export interface BusinessHoursConfig {
  enabled: boolean;
  start: string;
  end: string;
  outOfHoursMessage: string;
  days: string[];
}

export interface WhatsappBotConfig {
  isActive: boolean;
  botName: string;
  triggerKeywords: string;
  welcomeMessage: string;
  fallbackMessage: string;
  menuOptions: MenuOption[];
  businessHours: BusinessHoursConfig;
}
