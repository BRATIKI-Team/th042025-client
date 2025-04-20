export enum BotStatus {
    INACTIVE = 0,
    ACTIVE = 1
}

export interface IBotLight {
  readonly id: number;
  readonly name: string;
  readonly topic: string;
  readonly status: BotStatus;
}

export enum BotSourceType {
    TG = 0,
    SITE = 1
}

export interface IBotSource {
    readonly id: number;
    readonly name: string;
    readonly description: string;
    readonly type: BotSourceType;
    readonly url: string;
}

// Интерфейс для метрик, как они приходят с API
export interface IMetricData {
    date: string;
    value: number;
}

export interface IBotDetail extends IBotLight {
    readonly description: string;
    readonly users_count: number;
    readonly sources: readonly IBotSource[];
    // В интерфейсе используем Map для удобства работы с данными
    readonly metrics: Map<Date, number>;
}

// Интерфейс для метрик в формате API
export interface IBotDetailApi extends Omit<IBotDetail, 'metrics'> {
    readonly metrics: IMetricData[];
} 