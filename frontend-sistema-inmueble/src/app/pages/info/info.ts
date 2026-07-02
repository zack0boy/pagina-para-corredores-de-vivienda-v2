import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

interface SeccionInfo {
  titulo: string;
  subtitulo: string;
  bloques: { titulo: string; texto: string }[];
}

const SECCIONES: Record<string, SeccionInfo> = {
  nosotros: {
    titulo: 'Nosotros',
    subtitulo: 'Conoce quiénes somos y qué nos mueve.',
    bloques: [
      {
        titulo: 'Quiénes somos',
        texto: 'Inmuebles Chile es una plataforma inmobiliaria que conecta a personas con su hogar ideal. Trabajamos con corredores profesionales a lo largo de todo Chile para ofrecer un catálogo confiable de propiedades en venta y arriendo.',
      },
      {
        titulo: 'Nuestra misión',
        texto: 'Hacer que comprar, vender o arrendar una propiedad sea un proceso simple, transparente y seguro, apoyando tanto a clientes como a corredores con tecnología moderna.',
      },
      {
        titulo: 'Cómo trabajamos',
        texto: 'Cada propiedad publicada pasa por la revisión de un corredor asignado. Los pagos se registran y validan dentro de la plataforma, y las visitas se coordinan directamente con el corredor a cargo.',
      },
    ],
  },
  contacto: {
    titulo: 'Contacto',
    subtitulo: 'Estamos disponibles para ayudarte.',
    bloques: [
      {
        titulo: 'Correo electrónico',
        texto: 'Escríbenos a contacto@inmuebleschile.cl y te responderemos dentro de 24 horas hábiles.',
      },
      {
        titulo: 'Teléfono',
        texto: 'Llámanos al +56 2 2345 6789 de lunes a viernes, entre 9:00 y 18:00 horas.',
      },
      {
        titulo: 'Oficina',
        texto: 'Nos encontramos en Santiago, Chile. Si necesitas una reunión presencial, coordínala previamente por correo o teléfono.',
      },
    ],
  },
  blog: {
    titulo: 'Blog',
    subtitulo: 'Consejos y novedades del mundo inmobiliario.',
    bloques: [
      {
        titulo: 'Próximamente',
        texto: 'Estamos preparando artículos sobre tendencias del mercado inmobiliario chileno, guías para compradores y arrendatarios, y consejos para corredores. ¡Vuelve pronto!',
      },
      {
        titulo: 'Mientras tanto',
        texto: 'Puedes explorar nuestro catálogo de propiedades disponibles o contactarnos si tienes dudas sobre el proceso de compra o arriendo.',
      },
    ],
  },
  terminos: {
    titulo: 'Términos y Condiciones',
    subtitulo: 'Condiciones de uso de la plataforma Inmuebles Chile.',
    bloques: [
      {
        titulo: '1. Uso de la plataforma',
        texto: 'Inmuebles Chile es un servicio de intermediación que publica propiedades gestionadas por corredores registrados. La información de cada propiedad es proporcionada por el corredor responsable y puede cambiar sin previo aviso.',
      },
      {
        titulo: '2. Cuentas de usuario',
        texto: 'Para agendar visitas, publicar solicitudes o registrar pagos necesitas una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales y de la veracidad de los datos que entregas.',
      },
      {
        titulo: '3. Pagos',
        texto: 'Los pagos registrados en la plataforma quedan pendientes de validación por un administrador. Un comprobante subido no constituye confirmación automática del pago.',
      },
      {
        titulo: '4. Responsabilidad',
        texto: 'Inmuebles Chile no es propietaria de los inmuebles publicados. Las transacciones finales se realizan entre el cliente y el corredor o la empresa correspondiente.',
      },
    ],
  },
  privacidad: {
    titulo: 'Política de Privacidad',
    subtitulo: 'Cómo tratamos tus datos personales.',
    bloques: [
      {
        titulo: 'Datos que recopilamos',
        texto: 'Al registrarte guardamos tu nombre, correo electrónico y teléfono. Si registras pagos, almacenamos los montos, fechas y comprobantes que subas.',
      },
      {
        titulo: 'Uso de los datos',
        texto: 'Usamos tus datos para gestionar tu cuenta, coordinar visitas con corredores, validar pagos y enviarte notificaciones relacionadas con tu actividad en la plataforma. No vendemos tus datos a terceros.',
      },
      {
        titulo: 'Seguridad',
        texto: 'Las contraseñas se almacenan cifradas y el acceso a los datos está restringido según el rol de cada usuario (cliente, corredor o administrador).',
      },
      {
        titulo: 'Tus derechos',
        texto: 'Puedes solicitar la actualización o eliminación de tus datos escribiendo a contacto@inmuebleschile.cl.',
      },
    ],
  },
};

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterLink],
  templateUrl: './info.html',
  styleUrl: './info.css',
})
export class InfoPage implements OnInit {
  private route = inject(ActivatedRoute);

  seccion = signal<SeccionInfo | null>(null);

  ngOnInit(): void {
    // La sección viene en data.seccion de la ruta; se re-lee si cambia la ruta
    this.route.data.subscribe((data) => {
      this.seccion.set(SECCIONES[data['seccion']] ?? SECCIONES['nosotros']);
    });
  }
}
