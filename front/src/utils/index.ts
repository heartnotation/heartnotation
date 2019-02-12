import * as a from './api';
import { Annotation, Organization, Status, Tag, Point } from './objects';
export const API_URL = process.env.REACT_APP_API
  ? process.env.REACT_APP_API
  : '';

export const api = a;

export type Annotation = Annotation;
export type Organization = Organization;
export type Status = Status;
export type Tag = Tag;
export type Point = Point;
