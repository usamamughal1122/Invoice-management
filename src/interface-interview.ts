export interface ApiResponse<T> {
  message: string;
  result: boolean;
  data: T;
}

export interface Language {
  languageId: number;
  language: string;
  logo?: string | null;
  youtubePlayListUrl?: string | null;
}

export interface LanguageTopic {
  languageTopicId: number;
  languageId: number;
  topicName: string;
  orderNo: number;
  youtubeVideoUrl?: string | null;
}

export interface QuestionItem {
  question: string;
  answer: string; // HTML string
  topicName?: string;
  languageTopicId?: number;
  questionId?: number;
  language?: string;
  languageId?: number;
  orderNo?: number;
  logo?: string | null;
  tags?: string | null;
}

export interface QuestionCount {
  language: string;
  questionCount: number;
  languageId: number;
}
