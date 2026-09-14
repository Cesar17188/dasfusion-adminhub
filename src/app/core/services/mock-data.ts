import { Client } from '../models/client.model';
import { Project } from '../models/project.model';
import { DevPhase, TimeLogEntry } from '../models/development.model';
import { TestCase, BugReport } from '../models/qa-testing.model';
import { DeliveryMilestone } from '../models/delivery.model';
import { SyncLog } from '../models/supabase-config.model';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-01',
    name: 'Alejandro Morales',
    company: 'Nexus Logistics AI',
    email: 'a.morales@nexuslogistics.io',
    phone: '+1 (555) 349-8821',
    status: 'active',
    totalBudget: 48500,
    source: 'DASFusion-hub',
    createdAt: '2026-08-10T10:15:00Z',
    country: 'United States',
    tags: ['Enterprise', 'Supply Chain', 'AI Optimization'],
    hubMessage: 'Requerimos un sistema de optimización de rutas y predicción de demanda de flota con IA y dashboard en tiempo real.',
    notes: [
      { id: 'n1', author: 'César Admin', date: '2026-08-11 15:00', content: 'Reunión de kickoff completada. Requisitos de LLM y BigQuery confirmados.' },
      { id: 'n2', author: 'César Admin', date: '2026-08-28 11:30', content: 'Aprobada fase de arquitectura y diseño UI.' }
    ]
  },
  {
    id: 'cli-02',
    name: 'Elena Rostova',
    company: 'Fintech Vanguardia',
    email: 'elena.rostova@vanguardiafin.com',
    phone: '+34 912 345 678',
    status: 'active',
    totalBudget: 62000,
    source: 'DASFusion-hub',
    createdAt: '2026-08-18T14:30:00Z',
    country: 'España',
    tags: ['Fintech', 'Compliance', 'Microservicios'],
    hubMessage: 'Modernización del motor de scoring crediticio e integración con modelos predictivos de riesgo.',
    notes: [
      { id: 'n3', author: 'César Admin', date: '2026-08-19 09:00', content: 'Lead recibido desde DASFusion-hub. Alto potencial de contrato anual.' }
    ]
  },
  {
    id: 'cli-03',
    name: 'Dr. Roberto Méndez',
    company: 'BioHealth Analytics',
    email: 'rmendez@biohealth.lat',
    phone: '+52 55 4912 0041',
    status: 'negotiation',
    totalBudget: 34000,
    source: 'DASFusion-hub',
    createdAt: '2026-09-02T16:45:00Z',
    country: 'México',
    tags: ['HealthTech', 'Computer Vision', 'HIPAA'],
    hubMessage: 'Buscamos una solución para diagnóstico asistido por visión artificial en imágenes diagnósticas.',
    notes: [
      { id: 'n4', author: 'César Admin', date: '2026-09-04 12:00', content: 'Propuesta técnica enviada con SLA de 99.9% de disponibilidad.' }
    ]
  },
  {
    id: 'cli-04',
    name: 'Sophia Chang',
    company: 'AeroDynamics Global',
    email: 'schang@aerodynamics.co',
    phone: '+1 (415) 890-2311',
    status: 'lead',
    totalBudget: 85000,
    source: 'DASFusion-hub',
    createdAt: '2026-09-11T08:20:00Z',
    country: 'Canada',
    tags: ['IoT', 'Cloud Architecture', 'Real-Time'],
    hubMessage: 'Plataforma IoT de telemetría para monitoreo de turbinas aeronáuticas en vuelo con streaming de datos.',
    notes: [
      { id: 'n5', author: 'César Admin', date: '2026-09-11 10:00', content: 'Propuesta recibida en el Hub. Agendando demo para la próxima semana.' }
    ]
  },
  {
    id: 'cli-05',
    name: 'Carlos Benítez',
    company: 'OmniRetail Omnichannel',
    email: 'cbenitez@omniretail.es',
    phone: '+34 934 567 890',
    status: 'completed',
    totalBudget: 29000,
    source: 'Referral',
    createdAt: '2026-06-01T11:00:00Z',
    country: 'España',
    tags: ['E-Commerce', 'Next.js', 'ERP Sync'],
    hubMessage: 'Integración de inventarios multicanal y pasarela de pago personalizada.',
    notes: [
      { id: 'n6', author: 'César Admin', date: '2026-08-30 18:00', content: 'Proyecto finalizado exitosamente y entregado con satisfacción 5/5.' }
    ]
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-01',
    clientId: 'cli-01',
    clientName: 'Alejandro Morales',
    clientCompany: 'Nexus Logistics AI',
    title: 'FleetMind: Optimizador de Rutas y Predicción Logística con IA',
    description: 'Plataforma integral de simulación y predicción de tiempos de entrega, reducción de consumo de combustible y orquestación inteligente de flota vehicular mediante algoritmos genéticos y modelos LLM.',
    category: 'AI & Machine Learning',
    status: 'development',
    priority: 'high',
    budget: 48500,
    currency: 'USD',
    startDate: '2026-08-15',
    targetDeliveryDate: '2026-10-30',
    techStack: ['Angular 21', 'Python FastApi', 'PyTorch', 'Supabase', 'Docker', 'Google Cloud'],
    requirements: [
      { id: 'req-1', title: 'Motor de ruteo dinámico con mapas en vivo', isCompleted: true, priority: 'must_have' },
      { id: 'req-2', title: 'Dashboard analítico para operadores con KPIs de combustible', isCompleted: true, priority: 'must_have' },
      { id: 'req-3', title: 'Integración de alertas tempranas por clima adverso', isCompleted: false, priority: 'must_have' },
      { id: 'req-4', title: 'Exportación automatizada de reportes regulatorios en PDF/Excel', isCompleted: false, priority: 'nice_to_have' }
    ],
    hubSubmissionId: 'HUB-2026-089',
    progressPercentage: 62,
    leadScore: 94,
    assignedLeadDev: 'Ing. Carlos Vega',
    assignedQALead: 'Lic. Mariana Ruiz',
    createdAt: '2026-08-11T12:00:00Z'
  },
  {
    id: 'prj-02',
    clientId: 'cli-02',
    clientName: 'Elena Rostova',
    clientCompany: 'Fintech Vanguardia',
    title: 'VanguardRisk: Motor Predictivo de Scoring y Detección de Fraude',
    description: 'Sistema financiero de alta transaccionalidad para análisis de riesgo crediticio en tiempo real con microservicios escalables y cumplimiento estricto GDPR y PCI-DSS.',
    category: 'Enterprise Cloud',
    status: 'testing',
    priority: 'critical',
    budget: 62000,
    currency: 'EUR',
    startDate: '2026-07-20',
    targetDeliveryDate: '2026-09-28',
    techStack: ['TypeScript', 'Go Microservices', 'Supabase PostgreSQL', 'Kafka', 'Redis', 'Kubernetes'],
    requirements: [
      { id: 'req-5', title: 'Validación de identidad biométrica en onboarding', isCompleted: true, priority: 'must_have' },
      { id: 'req-6', title: 'Algoritmo de detección de transacciones anómalas (<50ms)', isCompleted: true, priority: 'must_have' },
      { id: 'req-7', title: 'Pruebas de estrés y penetración de seguridad bancaria', isCompleted: true, priority: 'must_have' },
      { id: 'req-8', title: 'Portal de auditoría interna y trazabilidad de decisiones', isCompleted: false, priority: 'must_have' }
    ],
    hubSubmissionId: 'HUB-2026-104',
    progressPercentage: 85,
    leadScore: 98,
    assignedLeadDev: 'Ing. David Salazar',
    assignedQALead: 'Ing. Andrés Peña',
    createdAt: '2026-08-19T09:30:00Z'
  },
  {
    id: 'prj-03',
    clientId: 'cli-03',
    clientName: 'Dr. Roberto Méndez',
    clientCompany: 'BioHealth Analytics',
    title: 'VisionMed AI: Asistente Diagnóstico de Imagenología',
    description: 'Herramienta médica asistida por redes neuronales convolucionales para segmentación y detección temprana de anomalías en tomografías computarizadas.',
    category: 'AI & Machine Learning',
    status: 'architecture',
    priority: 'medium',
    budget: 34000,
    currency: 'USD',
    startDate: '2026-09-08',
    targetDeliveryDate: '2026-12-15',
    techStack: ['Python', 'TensorFlow', 'React', 'FastAPI', 'DICOM Tools', 'Cloud Run'],
    requirements: [
      { id: 'req-9', title: 'Visor DICOM web con aceleración WebGL', isCompleted: false, priority: 'must_have' },
      { id: 'req-10', title: 'Pipeline de inferencia con modelos Vision Transformers', isCompleted: false, priority: 'must_have' },
      { id: 'req-11', title: 'Anonimización automática de datos de pacientes', isCompleted: true, priority: 'must_have' }
    ],
    hubSubmissionId: 'HUB-2026-118',
    progressPercentage: 20,
    leadScore: 88,
    assignedLeadDev: 'Dra. Sofía Luna',
    assignedQALead: 'Ing. Andrés Peña',
    createdAt: '2026-09-03T11:00:00Z'
  },
  {
    id: 'prj-04',
    clientId: 'cli-04',
    clientName: 'Sophia Chang',
    clientCompany: 'AeroDynamics Global',
    title: 'AeroStream: Telemetría de Turbinas en Tiempo Real',
    description: 'Ingesta masiva de sensores IoT aeronáuticos con streaming de telemetría de vuelo a más de 100,000 eventos/segundo y visualización 3D interactiva.',
    category: 'Automation & Bots',
    status: 'lead',
    priority: 'high',
    budget: 85000,
    currency: 'USD',
    startDate: '2026-10-01',
    targetDeliveryDate: '2027-02-28',
    techStack: ['Rust Core', 'WebSockets', 'Three.js', 'TimescaleDB', 'Supabase Auth', 'AWS/GCP Hybrid'],
    requirements: [
      { id: 'req-12', title: 'Recepción de paquetes binarios vía MQTT/UDP', isCompleted: false, priority: 'must_have' },
      { id: 'req-13', title: 'Gemelo digital en 3D de la turbina con mapa térmico', isCompleted: false, priority: 'must_have' }
    ],
    hubSubmissionId: 'HUB-2026-135',
    progressPercentage: 5,
    leadScore: 92,
    assignedLeadDev: 'Pendiente de asignación',
    assignedQALead: 'Pendiente de asignación',
    createdAt: '2026-09-11T08:25:00Z'
  },
  {
    id: 'prj-05',
    clientId: 'cli-05',
    clientName: 'Carlos Benítez',
    clientCompany: 'OmniRetail Omnichannel',
    title: 'OmniSync Core: Conector ERP & E-Commerce Global',
    description: 'Arquitectura de sincronización continua de stock, catálogo y pedidos entre SAP y Shopify Plus con latencia inferior a 2 segundos.',
    category: 'Fullstack Web',
    status: 'completed',
    priority: 'medium',
    budget: 29000,
    currency: 'EUR',
    startDate: '2026-06-10',
    targetDeliveryDate: '2026-08-25',
    actualDeliveryDate: '2026-08-24',
    techStack: ['Node.js', 'Next.js 14', 'PostgreSQL', 'Redis Cache', 'Vercel'],
    requirements: [
      { id: 'req-14', title: 'Webhooks bidireccionales de alta resiliencia', isCompleted: true, priority: 'must_have' },
      { id: 'req-15', title: 'Panel de control de errores y reintentos automáticos', isCompleted: true, priority: 'must_have' }
    ],
    hubSubmissionId: 'HUB-2026-042',
    progressPercentage: 100,
    leadScore: 85,
    assignedLeadDev: 'Ing. Carlos Vega',
    assignedQALead: 'Lic. Mariana Ruiz',
    createdAt: '2026-06-02T10:00:00Z'
  }
];

export const INITIAL_DEV_PHASES: DevPhase[] = [
  // Phases for FleetMind (prj-01)
  {
    id: 'phase-01',
    projectId: 'prj-01',
    phaseName: 'Architecture & Specs',
    startDate: '2026-08-15',
    endDate: '2026-08-28',
    estimatedHours: 40,
    loggedHours: 38,
    status: 'completed',
    leadEngineer: 'Ing. Carlos Vega',
    progressPercentage: 100,
    tasks: [
      { id: 't1', title: 'Diseño de esquema relacional en Supabase', assignee: 'Carlos Vega', estimatedHours: 12, spentHours: 10, isDone: true },
      { id: 't2', title: 'Especificación OpenAPI de endpoints de ruteo', assignee: 'Carlos Vega', estimatedHours: 14, spentHours: 14, isDone: true },
      { id: 't3', title: 'Definición de tokens de diseño UI DASFusion', assignee: 'David Salazar', estimatedHours: 14, spentHours: 14, isDone: true }
    ]
  },
  {
    id: 'phase-02',
    projectId: 'prj-01',
    phaseName: 'Frontend Engineering',
    startDate: '2026-08-29',
    endDate: '2026-09-25',
    estimatedHours: 85,
    loggedHours: 64,
    status: 'in_progress',
    leadEngineer: 'David Salazar',
    progressPercentage: 75,
    tasks: [
      { id: 't4', title: 'Mapa interactivo de vehículos y rutas con Leaflet/Mapbox', assignee: 'David Salazar', estimatedHours: 30, spentHours: 28, isDone: true },
      { id: 't5', title: 'Panel de telemetría y KPIs de combustible', assignee: 'David Salazar', estimatedHours: 25, spentHours: 22, isDone: true },
      { id: 't6', title: 'Módulo de filtros dinámicos y reportes exportables', assignee: 'David Salazar', estimatedHours: 30, spentHours: 14, isDone: false }
    ]
  },
  {
    id: 'phase-03',
    projectId: 'prj-01',
    phaseName: 'Backend & AI Core',
    startDate: '2026-09-01',
    endDate: '2026-10-10',
    estimatedHours: 110,
    loggedHours: 72,
    status: 'in_progress',
    leadEngineer: 'Carlos Vega',
    progressPercentage: 65,
    tasks: [
      { id: 't7', title: 'Algoritmo genético para cálculo óptimo de rutas', assignee: 'Carlos Vega', estimatedHours: 45, spentHours: 40, isDone: true },
      { id: 't8', title: 'Servicio FastAPI con workers asíncronos en Celery', assignee: 'Carlos Vega', estimatedHours: 35, spentHours: 25, isDone: true },
      { id: 't9', title: 'Integración de predicción meteorológica', assignee: 'Carlos Vega', estimatedHours: 30, spentHours: 7, isDone: false }
    ]
  },
  {
    id: 'phase-04',
    projectId: 'prj-01',
    phaseName: 'Integrations & APIs',
    startDate: '2026-09-20',
    endDate: '2026-10-20',
    estimatedHours: 45,
    loggedHours: 10,
    status: 'in_progress',
    leadEngineer: 'Sofía Luna',
    progressPercentage: 22,
    tasks: [
      { id: 't10', title: 'Conectores GPS con protocolos Teltonika y Queclink', assignee: 'Sofía Luna', estimatedHours: 25, spentHours: 10, isDone: false },
      { id: 't11', title: 'Webhooks de eventos para notificaciones SMS/Email', assignee: 'Sofía Luna', estimatedHours: 20, spentHours: 0, isDone: false }
    ]
  },
  // Phases for VanguardRisk (prj-02)
  {
    id: 'phase-05',
    projectId: 'prj-02',
    phaseName: 'Backend & AI Core',
    startDate: '2026-07-20',
    endDate: '2026-09-05',
    estimatedHours: 130,
    loggedHours: 128,
    status: 'completed',
    leadEngineer: 'David Salazar',
    progressPercentage: 100,
    tasks: [
      { id: 't12', title: 'Motor de reglas de scoring en Go', assignee: 'David Salazar', estimatedHours: 60, spentHours: 60, isDone: true },
      { id: 't13', title: 'Conexión a buró de crédito internacional', assignee: 'David Salazar', estimatedHours: 40, spentHours: 40, isDone: true },
      { id: 't14', title: 'Cifrado de datos en reposo y en tránsito (AES-256-GCM)', assignee: 'David Salazar', estimatedHours: 30, spentHours: 28, isDone: true }
    ]
  },
  {
    id: 'phase-06',
    projectId: 'prj-02',
    phaseName: 'Frontend Engineering',
    startDate: '2026-08-10',
    endDate: '2026-09-12',
    estimatedHours: 70,
    loggedHours: 68,
    status: 'completed',
    leadEngineer: 'Sofía Luna',
    progressPercentage: 100,
    tasks: [
      { id: 't15', title: 'Panel de revisión de expedientes para analistas de riesgo', assignee: 'Sofía Luna', estimatedHours: 45, spentHours: 44, isDone: true },
      { id: 't16', title: 'Gráficos interactivos de distribución de riesgo crediticio', assignee: 'Sofía Luna', estimatedHours: 25, spentHours: 24, isDone: true }
    ]
  }
];

export const INITIAL_TIME_LOGS: TimeLogEntry[] = [
  { id: 'tl-1', projectId: 'prj-01', phaseId: 'phase-02', engineerName: 'David Salazar', date: '2026-09-12', hours: 6.5, description: 'Implementación de markers dinámicos y clusters en el mapa de rutas' },
  { id: 'tl-2', projectId: 'prj-01', phaseId: 'phase-03', engineerName: 'Carlos Vega', date: '2026-09-12', hours: 7.0, description: 'Optimización de función de costo en algoritmo genético para evitar peajes costosos' },
  { id: 'tl-3', projectId: 'prj-01', phaseId: 'phase-04', engineerName: 'Sofía Luna', date: '2026-09-11', hours: 5.0, description: 'Pruebas de ingestión de tramas GPS vía Socket TCP' },
  { id: 'tl-4', projectId: 'prj-02', phaseId: 'phase-05', engineerName: 'David Salazar', date: '2026-09-10', hours: 8.0, description: 'Benchmark de latencia y ajuste de pool de conexiones PostgreSQL en Supabase' },
  { id: 'tl-5', projectId: 'prj-02', phaseId: 'phase-06', engineerName: 'Sofía Luna', date: '2026-09-09', hours: 6.0, description: 'Ajuste de validaciones de formulario de solicitud y estados de carga' }
];

export const INITIAL_TEST_CASES: TestCase[] = [
  {
    id: 'tc-01',
    projectId: 'prj-01',
    title: 'Cálculo de ruta con más de 50 paradas intermedias',
    type: 'integration',
    suite: 'Fleet Routing Engine',
    expectedResult: 'Tiempo de respuesta menor a 800ms con retorno de coordenadas ordenadas y distancia total',
    status: 'passed',
    lastRun: '2026-09-12 14:20',
    tester: 'Mariana Ruiz'
  },
  {
    id: 'tc-02',
    projectId: 'prj-01',
    title: 'Recuperación de socket tras pérdida momentánea de conexión 4G',
    type: 'e2e',
    suite: 'IoT Telemetry Stream',
    expectedResult: 'El cliente web reconecta automáticamente con backoff exponencial sin pérdida de paquetes',
    status: 'passed',
    lastRun: '2026-09-12 16:45',
    tester: 'Mariana Ruiz'
  },
  {
    id: 'tc-03',
    projectId: 'prj-01',
    title: 'Generación masiva de reportes PDF de fin de mes',
    type: 'performance',
    suite: 'Reporting Core',
    expectedResult: 'Procesamiento en segundo plano sin bloquear el hilo principal de la API',
    status: 'untested',
    lastRun: undefined,
    tester: 'Mariana Ruiz'
  },
  {
    id: 'tc-04',
    projectId: 'prj-02',
    title: 'Evaluación de solicitud de crédito con score menor a 400',
    type: 'unit',
    suite: 'Scoring Decision Logic',
    expectedResult: 'Rechazo automático con categorización de riesgo "Alto" y registro en tabla de auditoría',
    status: 'passed',
    lastRun: '2026-09-11 10:30',
    tester: 'Andrés Peña'
  },
  {
    id: 'tc-05',
    projectId: 'prj-02',
    title: 'Prueba de inyección SQL y XSS en endpoint de scoring',
    type: 'security',
    suite: 'Vulnerability & PenTest',
    expectedResult: 'HTTP 400 Bad Request con sanitización de inputs y cero filtraciones',
    status: 'passed',
    lastRun: '2026-09-11 11:15',
    tester: 'Andrés Peña'
  },
  {
    id: 'tc-06',
    projectId: 'prj-02',
    title: 'Simulación de 5,000 transacciones concurrentes por segundo',
    type: 'performance',
    suite: 'Stress & Load Testing',
    expectedResult: 'Latencia p99 inferior a 65ms y 0% de errores 5xx',
    status: 'passed',
    lastRun: '2026-09-12 18:00',
    tester: 'Andrés Peña'
  },
  {
    id: 'tc-07',
    projectId: 'prj-02',
    title: 'Flujo completo de aceptación UAT con el equipo de Fintech Vanguardia',
    type: 'uat',
    suite: 'User Acceptance Testing',
    expectedResult: 'Aprobación del CFO y oficial de cumplimiento',
    status: 'blocked',
    lastRun: '2026-09-13 09:00',
    tester: 'Andrés Peña'
  }
];

export const INITIAL_BUG_REPORTS: BugReport[] = [
  {
    id: 'bug-01',
    projectId: 'prj-01',
    title: 'Desfase de polilínea en mapa cuando la ruta cruza frontera horaria',
    description: 'En el mapa de rutas entre México y USA el cálculo horario causa que el estimado muestre horas negativas.',
    stepsToReproduce: '1. Seleccionar origen Tijuana y destino San Diego.\n2. Generar ruta.\n3. Observar tiempo estimado en panel lateral.',
    severity: 'medium',
    status: 'fixing',
    reportedBy: 'Mariana Ruiz',
    assignedDev: 'David Salazar',
    createdAt: '2026-09-11T16:30:00Z'
  },
  {
    id: 'bug-02',
    projectId: 'prj-01',
    title: 'Fuga de memoria en listener de WebSockets en navegadores Safari',
    description: 'Tras mantener abierta la pantalla por 20 minutos el uso de memoria RAM supera los 1.2 GB.',
    stepsToReproduce: '1. Abrir vista de telemetría en Safari iOS o Mac.\n2. Dejar corriendo el stream 20 minutos.\n3. Medir pestaña en devtools.',
    severity: 'high',
    status: 'open',
    reportedBy: 'Mariana Ruiz',
    assignedDev: 'David Salazar',
    createdAt: '2026-09-12T17:15:00Z'
  },
  {
    id: 'bug-03',
    projectId: 'prj-02',
    title: 'Timeout ocasional al consultar buró de crédito en fines de semana',
    description: 'El servicio externo de buró responde con latencia > 4000ms provocando un error genérico en la UI.',
    stepsToReproduce: '1. Ejecutar scoring con conexión simulada lenta de 5000ms.\n2. La UI muestra pantalla blanca en lugar de reintento amigable.',
    severity: 'medium',
    status: 'in_retest',
    reportedBy: 'Andrés Peña',
    assignedDev: 'Carlos Vega',
    createdAt: '2026-09-08T11:00:00Z',
    resolvedAt: '2026-09-12T19:00:00Z'
  }
];

export const INITIAL_DELIVERY_MILESTONES: DeliveryMilestone[] = [
  {
    id: 'del-01',
    projectId: 'prj-02',
    milestoneTitle: 'Release v1.0.0 - Go-Live en Producción VanguardRisk',
    releaseVersion: 'v1.0.0-rc3',
    dueDate: '2026-09-28',
    status: 'on_track',
    deploymentUrl: 'https://vanguardrisk.prod.dasfusion.cloud',
    notes: 'Entrega final para certificación bancaria y pase a producción en servidores dedicados.',
    checklist: [
      { id: 'c1', label: '100% de Pruebas Unitarias y de Integración aprobadas', isCompleted: true, isRequired: true, category: 'code_quality' },
      { id: 'c2', label: 'Auditoría de seguridad y escaneo de vulnerabilidades sin findings críticos', isCompleted: true, isRequired: true, category: 'security' },
      { id: 'c3', label: 'Pipeline de CI/CD automatizado con rollback en Kubernetes', isCompleted: true, isRequired: true, category: 'infrastructure' },
      { id: 'c4', label: 'Manual de usuario y documentación técnica de APIs entregada', isCompleted: true, isRequired: true, category: 'documentation' },
      { id: 'c5', label: 'Firma de acta de conformidad y aceptación UAT por el cliente', isCompleted: false, isRequired: true, category: 'client_approval' }
    ],
    clientSignOff: {
      isSigned: false,
      signedBy: 'Elena Rostova (Pendiente)',
      feedback: 'Estamos muy satisfechos con la velocidad del motor. Agendando firma final para el 26 de Septiembre.'
    }
  },
  {
    id: 'del-02',
    projectId: 'prj-01',
    milestoneTitle: 'Entrega de Beta Funcional FleetMind (Sprint 3)',
    releaseVersion: 'v0.8.0-beta',
    dueDate: '2026-10-15',
    status: 'on_track',
    deploymentUrl: 'https://fleetmind-staging.dasfusion.cloud',
    notes: 'Despliegue en ambiente Staging para pruebas con 10 vehículos de prueba de Nexus Logistics.',
    checklist: [
      { id: 'c6', label: 'Ruteador optimizado con integración de tráfico en tiempo real', isCompleted: true, isRequired: true, category: 'code_quality' },
      { id: 'c7', label: 'Dashboard operativo responsive verificado en tablets y desktop', isCompleted: true, isRequired: true, category: 'code_quality' },
      { id: 'c8', label: 'Configuración de variables de entorno y secrets en Supabase', isCompleted: true, isRequired: true, category: 'infrastructure' },
      { id: 'c9', label: 'Capacitación remota al equipo de despacho de Nexus Logistics', isCompleted: false, isRequired: false, category: 'documentation' }
    ],
    clientSignOff: {
      isSigned: false
    }
  },
  {
    id: 'del-03',
    projectId: 'prj-05',
    milestoneTitle: 'Entrega Final y Cierre de Proyecto OmniSync Core',
    releaseVersion: 'v1.2.0-stable',
    dueDate: '2026-08-25',
    actualDeliveryDate: '2026-08-24',
    status: 'accepted',
    deploymentUrl: 'https://omnisync.omniretail.es',
    notes: 'Proyecto entregado antes de la fecha límite pactada con calificación perfecta.',
    checklist: [
      { id: 'c10', label: 'Migración de catálogo completo de 45,000 SKUs', isCompleted: true, isRequired: true, category: 'code_quality' },
      { id: 'c11', label: 'Validación de webhook de pagos en pasarela bancaria', isCompleted: true, isRequired: true, category: 'security' },
      { id: 'c12', label: 'Firma de recepción y satisfacción del cliente', isCompleted: true, isRequired: true, category: 'client_approval' }
    ],
    clientSignOff: {
      isSigned: true,
      signedBy: 'Carlos Benítez (CEO OmniRetail)',
      signedAt: '2026-08-25T14:30:00Z',
      rating: 5,
      feedback: 'Excelente trabajo por parte del equipo de DASFusion. La sincronización es instantánea y no tuvimos downtime durante el Black Friday.'
    }
  }
];

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-13T19:00:00Z',
    type: 'auto',
    status: 'success',
    recordsSynced: 4,
    message: 'Sincronización automática periódica completada con Supabase DASFusion-hub.'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-13T18:00:00Z',
    type: 'realtime',
    status: 'success',
    recordsSynced: 1,
    message: 'Nueva propuesta detectada en Supabase: "AeroDynamics Global - AeroStream".'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-13T15:30:00Z',
    type: 'manual',
    status: 'success',
    recordsSynced: 5,
    message: 'Sincronización manual de clientes y proyectos ejecutada por el Administrador.'
  }
];
