import { API_URL, Annotation, Organization, Tag, Role, User, Status } from '.';
import {
  Interval,
  StatusInserter,
  AnnotationCommentPayload,
  AnnotationComment
} from './objects';
import axios, { AxiosResponse } from 'axios';
import { authenticate } from './auth';

const request = <T>(
  method: string,
  url: string,
  body: any | undefined
): Promise<T> => {
  return axios({ method, url, data: body })
    .then(res => res.data)
    .catch(async (err: AxiosResponse) => {
      if (err.status === 401) {
        const token = localStorage.getItem('access_token');
        if (!token) {
          return Promise.reject(err);
        }
        await authenticate(token);
        return axios({ method, url, data: body }).then(res => res.data);
      }
      return Promise.reject(err);
    });
};

const get = <T>(url: string): Promise<T> => {
  return request<T>('GET', `${API_URL}/${url}`, undefined);
};

const post = <T>(url: string, values: any): Promise<T> => {
  return request<T>('POST', `${API_URL}/${url}`, values);
};

const del = <T>(url: string): Promise<T> => {
  return request<T>('DELETE', `${API_URL}/${url}`, undefined);
};

const put = <T>(url: string, values: any): Promise<T> => {
  return request<T>('PUT', `${API_URL}/${url}`, values);
};

export const getAnnotations = (): Promise<Annotation[]> => {
  return get<Annotation[]>(urls.annotations).then(annotations => {
    annotations.forEach((a: Annotation) => {
      a.creation_date = new Date(a.creation_date);
      if (a.edit_date) {
        a.edit_date = new Date(a.edit_date);
      }
      if (a.status) {
        a.status.forEach((s: Status) => (s.date = new Date(s.date)));
      }
    });
    return annotations;
  });
};

export const getAnnotationById = (id: number): Promise<Annotation> => {
  return get<Annotation>(`${urls.annotations}/${id}`).then(annotation => {
    annotation.creation_date = new Date(annotation.creation_date);
    if (annotation.edit_date) {
      annotation.edit_date = new Date(annotation.edit_date);
    }
    if (annotation.status) {
      annotation.status.forEach((s: Status) => (s.date = new Date(s.date)));
    }
    return annotation;
  });
};

export const sendAnnotation = (datas: Annotation): Promise<Annotation> => {
  return post<Annotation>(`${urls.annotations}`, datas);
};

export const sendAnnotationComment = (
  datas: AnnotationCommentPayload
): Promise<AnnotationComment> => {
  return post<AnnotationComment>(`${urls.annotationsComments}`, datas).then(
    (response: AnnotationComment) => {
      response.date = new Date(response.date);
      return response;
    }
  );
};

export const sendInterval = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervals}`, datas);
};

export const sendIntervalComment = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervalsComment}`, datas);
};

export const sendIntervalTags = (datas: Interval): Promise<Interval> => {
  return post<Interval>(`${urls.intervalsTags}`, datas);
};

export const sendUser = (datas: User): Promise<User> => {
  return post<User>(`${urls.users}`, datas);
};

export const changeAnnotation = (datas: Annotation): Promise<Annotation> => {
  const d: any = {
    ...datas,
    organization_id: datas.organization ? datas.organization.id : undefined,
    parent_id: datas.parent ? datas.parent.id : undefined,
    tags: datas.tags.map(t => t.id),
    status: undefined,
    organization: undefined,
    parent: undefined
  };
  return put<Annotation>(`${urls.annotations}`, d);
};

export const getOrganizations = (): Promise<Organization[]> => {
  return get<Organization[]>(urls.organizations);
};

export const getOrganizationById = (id: number): Promise<Organization> => {
  return get<Organization>(`${urls.organizations}/${id}`);
};

export const getTags = (): Promise<Tag[]> => {
  return get<Tag[]>(urls.tags);
};

export const getTagById = (id: number): Promise<Tag> => {
  return get<Tag>(`${urls.tags}/${id}`);
};

export const checkSignal = (id: number): Promise<any> => {
  return get(`${urls.signal}/${id}`);
};

export const getRoles = (): Promise<Role[]> => {
  return get<Role[]>(urls.roles);
};

export const getAllUsers = (): Promise<User[]> => {
  return get<User[]>(urls.users);
};

export const modifyUser = (datas: User): Promise<User> => {
  return put<User>(`${urls.users}`, datas);
};

export const deleteUser = (datas: User): Promise<User> => {
  return del(`${urls.users}/${datas.id}`);
};

export const getCommentsOnAnnotationById = (
  id: number
): Promise<AnnotationComment[]> => {
  return get<AnnotationComment[]>(`${urls.annotationsComments}/${id}`).then(
    (response: AnnotationComment[]) => {
      response.forEach(comment => (comment.date = new Date(comment.date)));
      return response;
    }
  );
};

export const sendStatus = (s: StatusInserter): Promise<StatusInserter> => {
  return put<StatusInserter>(`${urls.annotationsStatus}`, s);
};

const urls = {
  annotations: 'annotations',
  annotationsComments: 'annotations/comments',
  organizations: 'organizations',
  tags: 'tags',
  signal: 'signal',
  status: 'status',
  roles: 'roles',
  users: 'users',
  intervals: 'intervals',
  intervalsComment: 'intervals/comment',
  intervalsTags: 'intervals/tags',
  annotationsStatus: 'annotations/status'
};
