import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private validateCredentials() {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new BadRequestException('Credenciales de Google no configuradas');
    }
    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new BadRequestException('ID de Google Calendar no configurado');
    }
  }

  private getCalendar() {
    this.validateCredentials();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL!,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
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
    email_corredor?: string;
  }): Promise<string> {
    try {
      const calendar = this.getCalendar();

      const attendees = data.email_corredor
        ? [{ email: data.email_corredor, responseStatus: 'needsAction' }]
        : [];

      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        requestBody: {
          summary: data.titulo,
          description: data.descripcion,
          start: { dateTime: data.fechaInicio.toISOString() },
          end: { dateTime: data.fechaFin.toISOString() },
          attendees,
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error('Error al crear evento en Google Calendar:', error);
      throw new BadRequestException('Error al sincronizar con Google Calendar');
    }
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
    try {
      const calendar = this.getCalendar();

      await calendar.events.patch({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
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
    } catch (error) {
      console.error('Error al actualizar evento en Google Calendar:', error);
      throw new BadRequestException(
        'Error al actualizar sincronización con Google Calendar',
      );
    }
  }

  async deleteEvent(googleEventId: string): Promise<void> {
    try {
      const calendar = this.getCalendar();

      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        eventId: googleEventId,
      });
    } catch (error) {
      console.error('Error al eliminar evento en Google Calendar:', error);
      throw new BadRequestException(
        'Error al eliminar sincronización con Google Calendar',
      );
    }
  }

  async getEvent(googleEventId: string) {
    try {
      const calendar = this.getCalendar();

      const response = await calendar.events.get({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        eventId: googleEventId,
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener evento de Google Calendar:', error);
      throw new BadRequestException(
        'Error al obtener evento de Google Calendar',
      );
    }
  }
}