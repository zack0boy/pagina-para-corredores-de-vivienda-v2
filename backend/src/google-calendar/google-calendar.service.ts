import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private getCalendar() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
  }

  async createEvent(data: {
    titulo: string;
    descripcion?: string;
    fechaInicio: Date;
    fechaFin: Date;
  }): Promise<string> {
    const calendar = this.getCalendar();

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: data.titulo,
        description: data.descripcion,
        start: { dateTime: data.fechaInicio.toISOString() },
        end: { dateTime: data.fechaFin.toISOString() },
      },
    });

    return response.data.id!;
  }

  async updateEvent(
    googleEventId: string,
    data: {
      titulo?: string;
      descripcion?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
    },
  ): Promise<void> {
    const calendar = this.getCalendar();

    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: googleEventId,
      requestBody: {
        summary: data.titulo,
        description: data.descripcion,
        start: data.fechaInicio
          ? { dateTime: data.fechaInicio.toISOString() }
          : undefined,
        end: data.fechaFin
          ? { dateTime: data.fechaFin.toISOString() }
          : undefined,
      },
    });
  }

  async deleteEvent(googleEventId: string): Promise<void> {
    const calendar = this.getCalendar();

    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: googleEventId,
    });
  }
}