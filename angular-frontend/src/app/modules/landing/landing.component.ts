import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service'

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule 
  ],
  templateUrl: './landing.component.html',
  styleUrls: []
})
export class LandingComponent implements OnInit {

  // Contenido extraído del documento
  // Frase de impacto corregida
  impactPhrase: string = '“El cuerpo corre pero la mente decide donde. Entrenar la mente es tan importante como entrenar el cuerpo.”'; 
  subtitle: string = '“Psicología deportiva aplicada: claridad, estructura y emoción para que cada equipo rinda al máximo.”'; 
  aboutMeText: string = 'Soy psicóloga deportiva. Mi misión es transformar la psicología en recursos prácticos que entrenadores y atletas puedan aplicar en cada entrenamiento y competición. Trabajo con rutinas claras, señales visuales y hábitos que fortalecen la atención, la motivación, la cohesión del equipo….”'; 
  servicesIntro: string = 'Diseño intervenciones psicológicas adaptadas a cada fase del entrenamiento y la competición. Colaboro con entrenadores y equipos para que variables como la atención, la concentración, la motivación, la confianza, el manejo del estrés, la resiliencia y la cohesión grupal se conviertan en hábitos sólidos que potencien el rendimiento.'; 
  contactText: string = '¿Quieres que trabajemos juntos? Escríbeme y diseñaremos el plan psicológico que mejor se adapte a tu equipo.'; 
  
  currentYear: number = new Date().getFullYear();

  // Lista de variables trabajadas (Servicios)
  variablesList = [
    { title: 'Atención y concentración', description: 'Rutinas para mantener el foco en momentos clave.' }, 
    { title: 'Manejo del estrés competitivo', description: 'Estrategias para afrontar la presión y responder con calma.' }, 
    { title: 'Motivación intrínseca y extrínseca', description: 'Sostener el esfuerzo y la ilusión a lo largo de la temporada.' }, 
    { title: 'Autoconfianza y autoeficacia', description: 'Reforzar la percepción de capacidad y seguridad en la acción.' }, 
    { title: 'Comunicación eficaz', description: 'Mejorar la interacción entre jugadores y entrenadores.' }, 
    { title: 'Cohesión grupal', description: 'Dinámicas que fortalecen la unidad y la cooperación.' }, 
    { title: 'Resiliencia y tolerancia a la frustración', description: 'Recursos para recuperarse de errores y mantener la energía.' }, 
    { title: 'Planificación mental y rutinas precompetitivas', description: 'Guías prácticas para preparar la mente antes de cada partido.' } 
  ];

  // Contenido para el Footer
  footerContent = [
    { 
      title: 'Atención y concentración', 
      text: 'Rutinas para mantener el foco en momentos clave y fortalecer la atención.'
    },
    { 
      title: 'Cohesión grupal', 
      text: 'Dinámicas que fortalecen la unidad y mejoran la cooperación del equipo.'
    },
    { 
      title: 'Resiliencia y Planificación', 
      text: 'Guías prácticas para preparar la mente y recursos para recuperarse de errores.'
    }
  ];

  // Modelo para el formulario de contacto
  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private contactService: ContactService) { }

  ngOnInit(): void { }

  /**
   * Lógica para enviar el formulario a la API de Symfony
   */
  onSubmit(): void {
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      this.contactService.sendForm(this.contactForm).subscribe({
        next: (response) => {
          console.log('Éxito:', response);
          alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al enviar:', error);
          alert('Hubo un error al enviar el mensaje. Verifica que el backend esté encendido.');
        }
      });
    }
  }

  private resetForm(): void {
    this.contactForm = { name: '', email: '', message: '' };
  }
}