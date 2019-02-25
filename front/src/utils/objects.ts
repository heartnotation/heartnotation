export interface Annotation {
  id: number;
  name: string;
  organization: Organization;
  status?: Status[];
  last_status: Status;
  first_status: Status;
  parent: Annotation;
  signal?: Point[][];
  signal_id: string;
  creation_date: Date;
  edit_date?: Date;
  is_active: boolean;
  is_editable: boolean;
  tags: Tag[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Status {
  id: number;
  date: Date;
  enum_status_id: number;
  enum_status: EnumStatus;
  user_id: number;
  user: User;
  annotation_id: number;
  annotation: Annotation;
}

export interface StatusInserter {
  enum_status_id: number;
  user_id: number;
  annotation_id: number;
}

export interface EnumStatus {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Tag {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
  is_active: boolean;
}

export interface User {
  id: number;
  mail: string;
  role: Role;
  organizations: Organization[];
  is_active: boolean;
}

export interface AnnotationCommentPayload {
  annotation_id: number;
  comment: string;
}

export interface AnnotationComment {
  id: number;
  comment: string;
  date: Date;
  user: User;
}

export interface IntervalCommentPayload {
  interval_id: number;
  comment: string;
}

export interface IntervalComment {
  id: number;
  comment: string;
  date: Date;
  user: User;
}

export interface Interval {
  id: number;
  annotation_id: number;
  user: User;
  comments: IntervalComment[];
  time_start: number;
  time_end: number;
  tags: Tag[];
}

export interface IntervalPayload {
  annotation_id: number;
  time_start: number;
  time_end: number;
}

export interface IntervalTagsPayload {
  interval_id: number;
  tags: number[];
}
