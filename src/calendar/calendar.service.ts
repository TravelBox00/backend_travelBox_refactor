/* eslint-disable import/prefer-default-export */
/* eslint-disable no-return-await */
/* eslint-disable import/extensions */
import { ResultSetHeader } from 'mysql2';
import * as calendarModel from './calendar.model.ts';
import { pool } from '../configs/database/mysqlConnect.ts';
import { Calendar } from './calendar.model.ts';

// 일정 추가
export const addCalendar = async (
  calendar: Calendar
): Promise<{ travelId: number }> => {
  const result = await calendarModel.insertCalendar(calendar);
  return result;
};

// 일정 삭제
export const removeCalendar = async (travelId: number) => {
  const query = `
    DELETE FROM TravelCalendar
    WHERE travelId = ?
  `;

  const [result] = await pool.query<ResultSetHeader>(query, [travelId]);

  return result;
};

// 일정 수정
export const fixCalendar = async (calendar: {
  travelId: number;
  travelTitle: string;
  travelContent?: string;
  travelStartDate?: string;
  travelEndDate?: string;
}): Promise<{ affectedRows: number }> => {
  const result = await calendarModel.updateCalendar(calendar);
  return { affectedRows: (result as ResultSetHeader).affectedRows };
};

// 내 일정 조회
export const getMySchedule = async (userTag: string, date: string) => {
  return await calendarModel.getMySchedule(userTag, date);
};
