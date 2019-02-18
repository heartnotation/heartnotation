export interface Annotation {
  id: number;
  name: string;
  organization: Organization;
  status: Status;
  parent: Annotation;
  signal?: Point[][];
  signal_id: number;
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
  content: string;
}

export interface Interval {
  id?: number;
  annotation_id: number;
  user_id?: number;
  comment?: string;
  start: number;
  end: number;
  tags?: number[];
}
