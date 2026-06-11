/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { CalendarProps, Event, View, ViewProps } from "react-big-calendar";
import { PostProp, PostPageProps, PostStatusProp } from "@/prop/post/post";
import { INoteResponse } from "@/prop/note";
import { TimetableProp } from "@/prop/workspace";

export type EventType = "single" | "multi";

export interface CustomEvent extends Omit<Event, "start" | "end"> {
  resourceId?: string;
  id: number;
  start: Date;
  end: Date;
  // optional blog/post specific fields (make optional)
  post?: PostProp;
  post_status?: PostStatusProp;
  type?: EventType;
  page?: PostPageProps[];
  raw:
    | {
        [key: string]: any;
        AppointedToName?: string | undefined;
        CustomerName?: string | undefined;
        AppointmentStatus?: string | undefined;
      }
    | undefined;
}

export type CustomViewStatic = {
  navigate(date: Date, action: NavigateAction, props: any): Date;
  title(date: Date, options: TitleOptions): string | React.JSX.Element;
};

export type CustomViewProps<TEvent extends Event, TResource extends object> =
  | View[]
  | {
      work_week?:
        | boolean
        | (React.ComponentType<any> & CustomViewStatic)
        | undefined;
      day?: boolean | (React.ComponentType<any> & CustomViewStatic) | undefined;
      agenda?:
        | boolean
        | (React.ComponentType<any> & CustomViewStatic)
        | undefined;
      month?:
        | boolean
        | (React.ComponentType<any> & CustomViewStatic)
        | undefined;
      week?:
        | boolean
        | (React.ComponentType<any> & CustomViewStatic)
        | undefined;
    };

declare module "react-big-calendar" {
  export interface CalendarProps<
    TEvent extends Event = Event,
    TResource extends object = object,
  > {
    // *: các key add thêm vào
    labels?: LabelProp[];
    timetables?: TimetableProp[];
    notes?: INoteResponse[];
    onDeleteNote?: (note: INoteResponse) => void;
    views?: CustomViewProps<TEvent, TResource>;
    stories?: PostPageProps[];
    onStoryClick?: (timeRange: [Date, Date]) => void;
  }
}
