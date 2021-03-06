import * as a from './api';
import * as au from './auth';
import {
  Annotation,
  Organization,
  Status,
  Tag,
  Point,
  Role,
  User,
  StatusInserter,
  Interval,
  IntervalPayload,
  IntervalTagsPayload,
  AnnotationStatus,
  EnumStatus,
  AnnotationComment,
  AnnotationCommentPayload,
  IntervalCommentPayload,
  IntervalComment
} from './objects';
export const API_URL = process.env.REACT_APP_API
  ? process.env.REACT_APP_API
  : '';

export const api = a;

export type Annotation = Annotation;
export type Organization = Organization;
export type Status = Status;
export type Tag = Tag;
export type Point = Point;
export type Role = Role;
export type User = User;
export type StatusInserter = StatusInserter;
export type IntervalPayload = IntervalPayload;
export type Interval = Interval;
export type IntervalTagsPayload = IntervalTagsPayload;
export type AnnotationStatus = AnnotationStatus;
export type EnumStatus = EnumStatus;
export type AnnotationCommentPayload = AnnotationCommentPayload;
export type AnnotationComment = AnnotationComment;
export type IntervalCommentPayload = IntervalCommentPayload;
export type IntervalComment = IntervalComment;

export const auth = au;
