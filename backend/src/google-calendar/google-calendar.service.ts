import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private validateCredentials() {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN
    ) {
      throw new BadRequestException(
        'Credenciales OAuth de Google no configuradas (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)',
      );
    }
  }

  private getCalendar() {
    this.validateCredentials();

    // Cliente OAuth2 con el refresh_token: actúa en nombre de la cuenta que autorizó
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return google.calendar({ version: 'v3', auth: oauth2 });
  }

  // ID del calendario destino. 'primary' = el calendario principal de la cuenta autorizada.
  private get calendarId(): string {
    return process.env.GOOGLE_CALENDAR_ID || 'primary';
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
        calendarId: this.calendarId,
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
        calendarId: this.calendarId,
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
        calendarId: this.calendarId,
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
        calendarId: this.calendarId,
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