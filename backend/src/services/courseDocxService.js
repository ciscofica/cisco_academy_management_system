import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar imagen del logo de la UTN
function getLogoBuffer() {
  const logoPath = path.join(__dirname, "../assets/logo_utn.png");
  if (fs.existsSync(logoPath)) {
    return fs.readFileSync(logoPath);
  }
  return null;
}

// Formateador de fechas
function formatDate(dateStr) {
  if (!dateStr) return "Por definir";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-EC", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateStr);
  }
}

function formatWeekdayDate(dateStr, withComma = false) {
  if (!dateStr) return "Por definir";
  try {
    const d = new Date(dateStr);
    const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    let dayIndex, dayNum, monthIndex, yearNum;
    if (typeof dateStr === "string" && dateStr.includes("-")) {
      const parts = dateStr.split("T")[0].split("-");
      if (parts.length === 3) {
        const utcDate = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
        dayIndex = utcDate.getUTCDay();
        dayNum = utcDate.getUTCDate();
        monthIndex = utcDate.getUTCMonth();
        yearNum = utcDate.getUTCFullYear();
      }
    }
    if (dayIndex === undefined) {
      dayIndex = d.getDay();
      dayNum = d.getDate();
      monthIndex = d.getMonth();
      yearNum = d.getFullYear();
    }
    const dayName = days[dayIndex];
    const monthName = months[monthIndex];
    if (withComma) {
      return `${dayName}, ${dayNum} de ${monthName} de ${yearNum}`;
    }
    return `${dayName} ${dayNum} de ${monthName} de ${yearNum}`;
  } catch {
    return String(dateStr);
  }
}

// Estilos de bordes y colores
const COLOR_PRIMARY = "005073"; // Azul institucional FICA
const COLOR_TEXT = "1f2937"; // Gris oscuro texto
const COLOR_MUTED = "4b5563"; // Gris secundario
const COLOR_BG_HEADER = "f1f5f9"; // Fondo de tablas
const BORDER_LIGHT = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: "cbd5e1",
};

/**
 * Cabecera institucional oficial con el logo circular de la UTN y texto centrado:
 * UNIVERSIDAD TÉCNICA DEL NORTE
 * FACULTAD DE INGENIERÍA EN CIENCIAS APLICADAS
 * ACADEMIA CISCO
 */
function createInstitutionalHeader() {
  const logoBuf = getLogoBuffer();

  const logoCellContent = logoBuf
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: logoBuf,
              transformation: { width: 72, height: 72 },
            }),
          ],
        }),
      ]
    : [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "UTN", bold: true, size: 28, color: COLOR_PRIMARY })],
        }),
      ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 14, color: "003366" },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
            },
            children: logoCellContent,
          }),
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: "UNIVERSIDAD TÉCNICA DEL NORTE",
                    bold: true,
                    size: 26,
                    font: "Arial",
                    color: "111827",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: "FACULTAD DE INGENIERÍA EN CIENCIAS APLICADAS",
                    bold: true,
                    size: 22,
                    font: "Arial",
                    color: "1f2937",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: "ACADEMIA CISCO",
                    bold: true,
                    size: 22,
                    font: "Arial",
                    color: COLOR_PRIMARY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createDocTitle(title, subtitle = null) {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 26,
          underline: {},
          color: COLOR_PRIMARY,
          font: "Arial",
        }),
      ],
    }),
  ];

  if (subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            size: 20,
            color: COLOR_MUTED,
            font: "Arial",
          }),
        ],
      })
    );
  }
  return children;
}

function createSectionHeading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: COLOR_PRIMARY,
        font: "Arial",
      }),
    ],
  });
}

function createParagraph(text, isBold = false, isItalic = false) {
  return new Paragraph({
    spacing: { after: 100, line: 260 },
    children: [
      new TextRun({
        text,
        bold: isBold,
        italics: isItalic,
        size: 20,
        color: COLOR_TEXT,
        font: "Arial",
      }),
    ],
  });
}

function createBulletItem(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: boldPrefix ? `${boldPrefix}: ` : "",
        bold: true,
        size: 20,
        font: "Arial",
      }),
      new TextRun({
        text,
        size: 20,
        font: "Arial",
      }),
    ],
  });
}

function createKeyValueTable(items) {
  const rows = items.map(
    ([key, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_LIGHT,
              bottom: BORDER_LIGHT,
              left: BORDER_LIGHT,
              right: BORDER_LIGHT,
            },
            shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: key,
                    bold: true,
                    size: 20,
                    font: "Arial",
                    color: "334155",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_LIGHT,
              bottom: BORDER_LIGHT,
              left: BORDER_LIGHT,
              right: BORDER_LIGHT,
            },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: String(value || "—"),
                    size: 20,
                    font: "Arial",
                    color: COLOR_TEXT,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: BORDER_LIGHT,
      bottom: BORDER_LIGHT,
      left: BORDER_LIGHT,
      right: BORDER_LIGHT,
    },
    rows,
  });
}

function createBlankSpace(lines = 3) {
  const result = [];
  for (let i = 0; i < lines; i++) {
    result.push(
      new Paragraph({
        spacing: { before: 60, after: 100 },
        children: [
          new TextRun({
            text: "",
            font: "Arial",
          }),
        ],
      })
    );
  }
  return result;
}

function createDataTable(headers, dataRows, widths = null) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => {
      const cellWidth = widths && widths[i] ? widths[i] : Math.floor(100 / headers.length);
      return new TableCell({
        width: { size: cellWidth, type: WidthType.PERCENTAGE },
        borders: {
          top: BORDER_LIGHT,
          bottom: BORDER_LIGHT,
          left: BORDER_LIGHT,
          right: BORDER_LIGHT,
        },
        shading: { type: ShadingType.CLEAR, fill: "E2E8F0" },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: h,
                bold: true,
                size: 19,
                font: "Arial",
                color: "1e293b",
              }),
            ],
          }),
        ],
      });
    }),
  });

  const bodyRows = dataRows.map(
    (row) =>
      new TableRow({
        children: row.map((cellText, i) => {
          const cellWidth = widths && widths[i] ? widths[i] : Math.floor(100 / headers.length);
          const raw = cellText !== null && cellText !== undefined ? String(cellText) : "—";
          const lines = raw.split("\n");
          const isNum = typeof cellText === "number" || (!isNaN(cellText) && String(cellText).trim() !== "" && !raw.includes("\n"));
          const isTotal = row[1] === "Total" || row[2] === "Total" || row[0] === "TOTAL PRESUPUESTO";

          return new TableCell({
            width: { size: cellWidth, type: WidthType.PERCENTAGE },
            borders: {
              top: BORDER_LIGHT,
              bottom: BORDER_LIGHT,
              left: BORDER_LIGHT,
              right: BORDER_LIGHT,
            },
            shading: isTotal ? { type: ShadingType.CLEAR, fill: "F1F5F9" } : undefined,
            children: lines.map(
              (line) =>
                new Paragraph({
                  alignment: isNum ? AlignmentType.CENTER : AlignmentType.LEFT,
                  spacing: { before: 20, after: 20 },
                  children: [
                    new TextRun({
                      text: line,
                      bold: isTotal,
                      size: 18,
                      font: "Arial",
                      color: COLOR_TEXT,
                    }),
                  ],
                })
            ),
          });
        }),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: BORDER_LIGHT,
      bottom: BORDER_LIGHT,
      left: BORDER_LIGHT,
      right: BORDER_LIGHT,
    },
    rows: [headerRow, ...bodyRows],
  });
}

function createSignatureBlock(leftSign, rightSign) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({ spacing: { before: 400 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({
                    text: leftSign.name,
                    bold: true,
                    size: 20,
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: leftSign.title,
                    size: 18,
                    font: "Arial",
                    color: COLOR_MUTED,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: leftSign.institution || "ACADEMIA CISCO - UTN",
                    size: 17,
                    font: "Arial",
                    color: COLOR_MUTED,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [new Paragraph({})],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({ spacing: { before: 400 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({
                    text: rightSign.name,
                    bold: true,
                    size: 20,
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: rightSign.title,
                    size: 18,
                    font: "Arial",
                    color: COLOR_MUTED,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: rightSign.institution || "FACULTAD DE INGENIERÍA EN CIENCIAS APLICADAS",
                    size: 17,
                    font: "Arial",
                    color: COLOR_MUTED,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ============================================================================
// 1. GENERADOR DE PLANIFICACIÓN DE CURSO (DOCX)
// ============================================================================
export async function generatePlanificacionDocx(course) {
  const detail = course.Detail || {};
  const instructor = detail.Instructor || {};
  const modalities = detail.Modalities || [];
  const chapters = course.Chapters || [];
  const schedules = detail.Schedules || [];
  const costs = detail.Costs || [];

  const totalHours = Number(detail.total_hours) || 70;
  const instructorHours = Number(detail.instructor_hours) || 50;
  const costPerHour = Number(detail.cost_per_hour) || 13.0;
  const estimatedPay = (instructorHours * costPerHour).toFixed(2);
  const modalityStr = modalities.length > 0 ? modalities.map((m) => m.name).join(", ") : "híbrida";

  let scheduleText = "15 clases virtuales con instructor martes y jueves de 19h00 a 22h00,\n1 clase presencial con instructor sábado de 8h00 a 13h00";
  if (schedules.length > 0) {
    const formattedSchedules = schedules
      .map((s) => `${s.day_of_week || s.name || "Horario"}: ${s.start_time || ""} - ${s.end_time || ""}`.trim())
      .filter((str) => str.length > 3);
    if (formattedSchedules.length > 0) {
      scheduleText = formattedSchedules.join("\n");
    }
  }

  let costText = "Estudiantes, egresados, graduados y funcionarios de la UTN: 60,00 USD más el IVA\nParticulares: 100,00 USD más el IVA";
  if (costs.length > 0) {
    costText = costs
      .map((c) => `${c.cost_type || c.name || "Matrícula"}: ${Number(c.cost || 0).toFixed(2)} USD más el IVA`)
      .join("\n");
  }

  const generalInfoItems = [
    ["Nombre del curso:", course.course_name || "Curso Oficial Cisco"],
    ["Área temática:", "Redes"],
    ["Duración total:", `${totalHours} horas`],
    ["Modalidad:", modalityStr.toLowerCase()],
    ["Fecha de inicio y fin:", `${formatDate(course.start_date)} - ${formatDate(course.end_date)}`],
    ["Horario propuesto:", scheduleText],
    ["Dirigido a:", "público general"],
    ["Número de participantes:", "15-30"],
    ["Costo:", costText],
    ["Formas de pago:", "contado/dos pagos"],
    ["Responsable académico del curso:", "MSc. Ludmila Starodub"],
  ];

  // Temario curricular 100% dinámico desde la Base de Datos
  const chapterRows =
    chapters.length > 0
      ? chapters.map((ch, idx) => [
          String(idx + 1),
          ch.chapter_name || `Módulo ${idx + 1}`,
          ch.main_topics || "",
          String(ch.hours || 2),
          ch.modality || "Virtual",
        ])
      : [
          ["1", "Contenido inicial", "", "2", "Virtual"],
        ];

  const totalCalculatedHours = chapters.reduce((sum, ch) => sum + (Number(ch.hours) || 0), 0);
  chapterRows.push(["", "", "Total", String(totalCalculatedHours || totalHours), ""]);

  const budgetRows = [
    ["Honorarios docentes", `$ ${estimatedPay}`, `$${costPerHour.toFixed(2)} la hora por ${instructorHours} horas dictadas incluido el IVA`],
    ["Material didáctico", "0", "Equipos existentes del laboratorio de redes #4 FICA"],
    [
      "Plataforma tecnológica",
      "0",
      "Acceso a la plataforma virtual netacad internacional y aplicación para las clases virtuales webex es parte del convenio de la Academia CISCO",
    ],
    ["Publicidad y difusión", "0", "Página web, radio y TV de la UTN, Redes sociales"],
    ["Otros", "0", ""],
    ["Total", `$ ${estimatedPay}`, "Incluido el IVA"],
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 },
          },
        },
        children: [
          createInstitutionalHeader(),
          ...createDocTitle("PLANIFICACIÓN CURSO", null),

          createSectionHeading("1. Información General del Curso"),
          createKeyValueTable(generalInfoItems),

          createSectionHeading("2. Justificación del Curso"),
          createParagraph("Relevancia del curso:", true),
          ...createBlankSpace(4),
          createParagraph("A qué necesidades responde:", true),
          ...createBlankSpace(4),
          createParagraph("Relación con la misión y objetivos de la UTN:", true),
          ...createBlankSpace(4),

          createSectionHeading("3. Objetivos del Curso"),
          createParagraph("Objetivo general:", true),
          ...createBlankSpace(3),
          createParagraph("Objetivos específicos:", true),
          ...createBlankSpace(4),

          createSectionHeading("4. Contenidos del Curso"),
          createDataTable(
            ["Módulo", "Título del Módulo", "Temas principales", "Horas estimadas", "Modalidad"],
            chapterRows,
            [10, 26, 44, 10, 10]
          ),

          createSectionHeading("5. Metodología de Enseñanza-Aprendizaje"),
          createParagraph("Estrategias didácticas:", true),
          createParagraph("Clases magistrales virtuales: Explicación teórica de conceptos clave mediante presentaciones interactivas y videos de Cisco."),
          createParagraph("Talleres prácticos:"),
          createBulletItem("Presenciales", "Configuración de equipos físicos (routers, switches, dispositivos inalámbricos) en el laboratorio #4 de la FICA."),
          createBulletItem("Virtuales", "Simulaciones en Packet Tracer 8.0 (Modo Físico - PTPM) para prácticas remotas."),
          createParagraph("Estudios de caso: Análisis de escenarios reales de redes empresariales para aplicar soluciones de switching y routing"),
          createParagraph("Aprendizaje colaborativo: Trabajo en grupos para resolver problemas de configuración y troubleshooting."),

          createParagraph("Recursos y herramientas:", true),
          createParagraph("Tecnológicos:"),
          createBulletItem("Plataforma", "Cisco NetAcad (www.netacad.com) para acceso a materiales, laboratorios y evaluaciones."),
          createBulletItem("Simulador", "Packet Tracer 8.0 (64-bit) para simulaciones."),
          createBulletItem("Videoconferencias", "Webex para clases virtuales síncronas."),
          createParagraph("Pedagógicos:"),
          createBulletItem("Guías", "Guías de laboratorio paso a paso."),
          createBulletItem("Videos", "Videos demostrativos de Cisco."),
          createBulletItem("Interactivas", "Actividades interactivas (ej. verificadores de sintaxis, VSCs)."),

          createParagraph("Evaluación del aprendizaje:", true),
          createParagraph("Formativa:"),
          createBulletItem("VSC", "Verifique su Comprensión (VSC): Autoevaluaciones por módulo."),
          createBulletItem("Laboratorios", "Laboratorios y Packet Tracer: Entregables semanales."),
          createParagraph("Sumativa:"),
          createBulletItem("Exámenes de módulo", "Exámenes por módulo (5 en total). Valoración 30%"),
          createBulletItem("Habilidades y PT", "Practicas continuas PT o Equipos Fisicos y Examen de habiliadades - PTSA (Packet Tracer Skills Assessment). Valoración 40%"),
          createBulletItem("Evaluación final", "Examen teórico-práctico. Valoración 30%"),
          createParagraph("Puntaje total: 100%", true),

          createSectionHeading("6. Perfil del Docente o Equipo Docente que dictará el curso"),
          createParagraph(`Nombre: ${instructor.name || "Fabián Geovanny Cuzme Rodríguez"}`, true),
          createParagraph("Formación académica:", true),
          ...createBlankSpace(3),
          createParagraph("Experiencia profesional y docente:", true),
          ...createBlankSpace(3),
          createParagraph("CV resumido (adjuntar):", true),
          ...createBlankSpace(3),

          createSectionHeading("7. Evaluación del Curso"),
          createParagraph("Criterios e instrumentos para la evaluación por participantes:", true),
          createParagraph("Encuesta de fin de curso: Valoración de: Claridad del instructor; Utilidad de laboratorios/Packet Tracer; Cumplimiento de objetivos."),
          createParagraph("Sesión de retroalimentación: Reunión virtual al finalizar para recoger sugerencias."),
          createParagraph("Mecanismos de mejora continua:", true),
          createParagraph("Ajustes basados en feedback: Modificación de horas prácticas si se reportan dificultades; Inclusión de casos adicionales para temas complejos (ej. STP, EtherChannel)."),
          createParagraph("Actualización anual: Alineación con cambios en el examen CCNA 200-301."),

          createSectionHeading("8. Requerimientos Logísticos"),
          createParagraph("Aulas/espacios:", true),
          createBulletItem("Presencial", "Laboratorio #4 FICA (25 PCs con acceso a equipos Cisco)."),
          createBulletItem("Virtual", "Aula Cisco NetAcad + Webex para sesiones síncronas."),
          createParagraph("Materiales didácticos:", true),
          createParagraph("Equipos físicos (según alcance del curso):"),
          createBulletItem("Routers", "2 routers ISR4221/K9 (o equivalentes)."),
          createBulletItem("Switches", "2 switches Catalyst 2960+."),
          createBulletItem("Inalámbricos", "1 routers inalámbricos (WPA2/WPA3) – opcional."),
          createParagraph("Software:"),
          createBulletItem("Simulación", "Packet Tracer 8.0 (64-bit) instalado en todas las PCs."),
          createBulletItem("Análisis", "Wireshark para análisis de tráfico."),
          createParagraph("Plataformas tecnológicas:"),
          createParagraph("Obligatorias: Cisco NetAcad (inscripción previa de estudiantes), Webex para videoconferencias."),
          createParagraph("Opcionales: VirtualBox para emulación de servidores (ej. DHCP)."),
          createParagraph("Conectividad: Internet estable."),

          createSectionHeading("9. Presupuesto Estimado (si aplica)"),
          createDataTable(["Rubro", "Monto estimado", "Observaciones"], budgetRows, [30, 20, 50]),

          createSectionHeading("10. Firma del Responsable"),
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: "Nombre: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: "MSc. Ludmila Starodub", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "Cargo: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: "Analista de sistemas – Coordinadora Academia CISCO", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({ text: "Fecha presentación: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({
                text: formatDate(course.start_date) || "12 de enero del 2026",
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 240, after: 40 },
            children: [
              new TextRun({ text: "Firma: ________________________________________________", bold: true, size: 20, font: "Arial" }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// ============================================================================
// 2. GENERADOR DE CRONOGRAMA DE ACTIVIDADES (DOCX)
// ============================================================================
export async function generateCronogramaDocx(course) {
  const detail = course.Detail || {};
  const instructor = detail.Instructor || {};
  const chapters = course.Chapters || [];

  // 1. Obtener Horarios de clases sincrónicas y presenciales
  const schedules = detail.Schedules || [];
  let virtualSchedule = "";
  let presencialSchedule = "";

  schedules.forEach((sch) => {
    const desc = (sch.description || "").toLowerCase();
    const days = (sch.days || "").toLowerCase();
    const st = (sch.start_time || "").substring(0, 5).replace(":", "H");
    const et = (sch.end_time || "").substring(0, 5).replace(":", "H");
    const timeRange = st && et ? `${st} - ${et}` : "";

    if (
      desc.includes("presencial") ||
      days.includes("sábado") ||
      days.includes("sabado") ||
      days.includes("6")
    ) {
      if (timeRange) presencialSchedule = timeRange;
    } else {
      if (timeRange) virtualSchedule = timeRange;
    }
  });

  if (!virtualSchedule) virtualSchedule = "19H00 - 22H00";
  if (!presencialSchedule) presencialSchedule = "8H00 - 13H00";

  // 2. Período oficial del curso
  let period = "ENERO - MARZO 2026";
  if (course.start_date && course.end_date) {
    const months = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
    ];
    const d1 = new Date(course.start_date);
    const d2 = new Date(course.end_date);
    period = `${months[d1.getUTCMonth()]} - ${months[d2.getUTCMonth()]} ${d2.getUTCFullYear()}`;
  }

  // 3. Nombre corto del curso para el total
  let shortCourseName = course.course_name || "Curso";
  const shortMatch = (course.course_name || "").match(
    /^(CCNA\s*\d|CCNP\s*\d|DevNet|CyberOps|Python|Linux)/i
  );
  if (shortMatch) {
    shortCourseName = shortMatch[0].replace(/\s+/g, "");
  }

  // 4. Estilos de celda y bordes negros
  const BORDER_BLACK = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "000000",
  };
  const BORDERS_CELL = {
    top: BORDER_BLACK,
    bottom: BORDER_BLACK,
    left: BORDER_BLACK,
    right: BORDER_BLACK,
  };

  function makeCronoCell({
    text,
    lines,
    bold = false,
    align = AlignmentType.LEFT,
    fill = "FFFFFF",
    columnSpan = 1,
    size = 18,
    borders = BORDERS_CELL,
  }) {
    const contentLines =
      lines ||
      (text !== undefined && text !== null ? String(text).split("\n") : [""]);
    return new TableCell({
      columnSpan,
      borders,
      shading: { type: ShadingType.CLEAR, fill },
      children: contentLines.map(
        (l) =>
          new Paragraph({
            alignment: align,
            spacing: { before: 35, after: 35 },
            children: [
              new TextRun({
                text: l,
                bold,
                size,
                font: "Arial",
                color: "000000",
              }),
            ],
          })
      ),
    });
  }

  // Generador de fechas tentativas secuenciales en caso de fechas no definidas en DB
  const estimatedDates = [];
  let baseDate = course.start_date ? new Date(course.start_date) : new Date(2026, 0, 27);
  let curUtc = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));
  for (let i = 0; i < Math.max(chapters.length, 16); i++) {
    if (i > 0) {
      do {
        curUtc.setUTCDate(curUtc.getUTCDate() + 1);
      } while (curUtc.getUTCDay() !== 2 && curUtc.getUTCDay() !== 4 && curUtc.getUTCDay() !== 6);
    }
    estimatedDates.push(new Date(curUtc));
  }

  const tableRows = [];

  // Fila 1: Cabecera gris (CRONOGRAMA CURSO ACADEMIA CISCO FICA-UTN)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: "CRONOGRAMA CURSO ACADEMIA CISCO FICA-UTN",
          bold: true,
          align: AlignmentType.CENTER,
          fill: "D9D9D9",
          columnSpan: 5,
          size: 20,
        }),
      ],
    })
  );

  // Fila 2: Nombre del Curso
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: course.course_name || "CCNA1 v7: Introduction to Networks (ITN)",
          bold: true,
          align: AlignmentType.CENTER,
          fill: "EFEFEF",
          columnSpan: 5,
          size: 20,
        }),
      ],
    })
  );

  // Fila 3: PERIODO (Verde suave)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: `PERIODO: ${period}`,
          bold: true,
          align: AlignmentType.CENTER,
          fill: "D9EAD3",
          columnSpan: 5,
          size: 19,
        }),
      ],
    })
  );

  // Fila 4: FECHA INICIO (Naranja suave)
  const inicioFormatted = course.start_date
    ? formatWeekdayDate(course.start_date, false)
    : "martes 27 de enero de 2026";
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: `FECHA INICIO: ${inicioFormatted}`,
          bold: true,
          align: AlignmentType.LEFT,
          fill: "FCE5CD",
          columnSpan: 5,
          size: 18,
        }),
      ],
    })
  );

  // Fila 5: FECHA FINAL (Blanco)
  const finalFormatted = course.end_date
    ? formatWeekdayDate(course.end_date, false)
    : "Domingo 22 de marzo de 2026";
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: `FECHA FINAL: ${finalFormatted}`,
          bold: true,
          align: AlignmentType.LEFT,
          fill: "FFFFFF",
          columnSpan: 5,
          size: 18,
        }),
      ],
    })
  );

  // Fila 6: HORARIO VIRTUAL (Naranja suave)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: `HORARIO CLASES VIRTUALES SÍNCRONAS: ${virtualSchedule}`,
          bold: true,
          align: AlignmentType.LEFT,
          fill: "FCE5CD",
          columnSpan: 5,
          size: 18,
        }),
      ],
    })
  );

  // Fila 7: HORARIO PRESENCIAL (Blanco)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: `HORARIO CLASE PRESENCIAL: ${presencialSchedule}`,
          bold: true,
          align: AlignmentType.LEFT,
          fill: "FFFFFF",
          columnSpan: 5,
          size: 18,
        }),
      ],
    })
  );

  // Fila 8: Encabezados de columnas (Gris)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({ text: "Clase", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
        makeCronoCell({ text: "Fecha", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
        makeCronoCell({ text: "Núm. Horas", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
        makeCronoCell({ text: "Modalidad", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
        makeCronoCell({ text: "Capítulos", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
      ],
    })
  );

  // Fila 9: Sub-barra celeste (Clases con instructor)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: "Clases con instructor",
          bold: true,
          align: AlignmentType.LEFT,
          fill: "00B0F0",
          columnSpan: 5,
          size: 19,
        }),
      ],
    })
  );

  // Filas de sesiones / capítulos
  let instructorHoursSum = 0;

  if (chapters.length > 0) {
    chapters.forEach((ch, idx) => {
      const hours = Number(ch.hours) || 2;
      instructorHoursSum += hours;
      const isPresencial = (ch.modality || "").toLowerCase().includes("presencial");
      const rowFill = isPresencial ? "FFFF00" : "FFFFFF";

      const dateText = ch.start_date
        ? formatWeekdayDate(ch.start_date, true)
        : formatWeekdayDate(estimatedDates[idx], true);

      tableRows.push(
        new TableRow({
          children: [
            makeCronoCell({ text: String(idx + 1), align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({ text: dateText, align: AlignmentType.LEFT, fill: rowFill }),
            makeCronoCell({ text: String(hours), align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({
              text: isPresencial ? "Presencial" : (ch.modality || "Virtual"),
              align: AlignmentType.CENTER,
              fill: rowFill,
            }),
            makeCronoCell({ text: ch.chapter_name || `Capítulo ${idx + 1}`, align: AlignmentType.LEFT, fill: rowFill }),
          ],
        })
      );
    });
  } else {
    // 16 clases base estándar de CCNA1 según modelo oficial
    const defaultClasses = [
      { date: "martes, 27 de enero de 2026", h: 3, m: "Virtual", cap: "1. Networking Today\n2. Basic Switch and End device configuration" },
      { date: "jueves, 29 de enero de 2026", h: 3, m: "Virtual", cap: "3. Protocols and Models" },
      { date: "martes, 3 de febrero de 2026", h: 3, m: "Virtual", cap: "4. Physical Layer" },
      { date: "jueves, 5 de febrero de 2026", h: 3, m: "Virtual", cap: "5. Number Systems" },
      { date: "martes, 10 de febrero de 2026", h: 3, m: "Virtual", cap: "6. Data Link Layer" },
      { date: "jueves, 12 de febrero de 2026", h: 3, m: "Virtual", cap: "7. Ethernet Switching" },
      { date: "jueves, 19 de febrero de 2026", h: 3, m: "Virtual", cap: "8. Network Layer" },
      { date: "martes, 24 de febrero de 2026", h: 3, m: "Virtual", cap: "9. Address Resolution" },
      { date: "jueves, 26 de febrero de 2026", h: 3, m: "Virtual", cap: "10. Basic Router Configuration" },
      { date: "martes, 3 de marzo de 2026", h: 3, m: "Virtual", cap: "11. IPv4 Addressing & subnets" },
      { date: "jueves, 5 de marzo de 2026", h: 3, m: "Virtual", cap: "12. IPv6 Addressing" },
      { date: "martes, 10 de marzo de 2026", h: 3, m: "Virtual", cap: "13. ICMP" },
      { date: "jueves, 12 de marzo de 2026", h: 3, m: "Virtual", cap: "14. Transport Layer 15. Application Layer" },
      { date: "sábado, 14 de marzo de 2026", h: 5, m: "Presencial", cap: "Laboratorios equipos físicos" },
      { date: "martes, 17 de marzo de 2026", h: 3, m: "Virtual", cap: "16. Network Security Fundamentals" },
      { date: "jueves, 19 de marzo de 2026", h: 3, m: "Virtual", cap: "17. Build a Small Network" },
    ];

    defaultClasses.forEach((cl, idx) => {
      instructorHoursSum += cl.h;
      const isPresencial = cl.m === "Presencial";
      const rowFill = isPresencial ? "FFFF00" : "FFFFFF";

      tableRows.push(
        new TableRow({
          children: [
            makeCronoCell({ text: String(idx + 1), align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({ text: cl.date, align: AlignmentType.LEFT, fill: rowFill }),
            makeCronoCell({ text: String(cl.h), align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({ text: cl.m, align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({ text: cl.cap, align: AlignmentType.LEFT, fill: rowFill }),
          ],
        })
      );
    });
  }

  // Fila Subtotal: Total horas clase-instructor (Verde suave)
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: "Total horas clase-instructor",
          bold: true,
          align: AlignmentType.RIGHT,
          fill: "D9EAD3",
          columnSpan: 2,
        }),
        makeCronoCell({
          text: String(instructorHoursSum || 50),
          bold: true,
          align: AlignmentType.CENTER,
          fill: "D9EAD3",
        }),
        makeCronoCell({ text: "", fill: "FFFFFF", borders: { ...BORDERS_CELL, right: { style: BorderStyle.NONE } } }),
        makeCronoCell({ text: "", fill: "FFFFFF", borders: { ...BORDERS_CELL, left: { style: BorderStyle.NONE } } }),
      ],
    })
  );

  // Fila: Actividades en la plataforma virtual (Lila suave)
  const actHours = detail.activities_hours
    ? Number(detail.activities_hours) >= 3
      ? Number(detail.activities_hours) - 3
      : Number(detail.activities_hours)
    : 17;

  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: "Actividades en la plataforma virtual",
          bold: true,
          align: AlignmentType.LEFT,
          fill: "D9D2E9",
          columnSpan: 2,
        }),
        makeCronoCell({
          text: String(actHours),
          bold: true,
          align: AlignmentType.CENTER,
          fill: "D9D2E9",
        }),
        makeCronoCell({
          text: "On-line",
          align: AlignmentType.CENTER,
          fill: "D9D2E9",
        }),
        makeCronoCell({
          text: "Laboratorios Packet tracer  y evaluaciones de los capítulos",
          align: AlignmentType.LEFT,
          fill: "D9D2E9",
        }),
      ],
    })
  );

  // Fila: Examen final (Naranja / Melón suave)
  const examDate = course.end_date
    ? formatWeekdayDate(course.end_date, true)
    : "domingo, 22 de marzo de 2026";

  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: examDate,
          bold: true,
          align: AlignmentType.LEFT,
          fill: "FCE5CD",
          columnSpan: 2,
        }),
        makeCronoCell({
          text: "3",
          bold: true,
          align: AlignmentType.CENTER,
          fill: "FCE5CD",
        }),
        makeCronoCell({
          text: "On-line",
          align: AlignmentType.CENTER,
          fill: "FCE5CD",
        }),
        makeCronoCell({
          text: "Exámen final",
          align: AlignmentType.LEFT,
          fill: "FCE5CD",
        }),
      ],
    })
  );

  // Fila: Total horas curso (Verde suave)
  const grandTotal = instructorHoursSum + actHours + 3;
  tableRows.push(
    new TableRow({
      children: [
        makeCronoCell({
          text: `Total horas curso ${shortCourseName}`,
          bold: true,
          align: AlignmentType.RIGHT,
          fill: "D9EAD3",
          columnSpan: 2,
        }),
        makeCronoCell({
          text: String(grandTotal),
          bold: true,
          align: AlignmentType.CENTER,
          fill: "D9EAD3",
        }),
        makeCronoCell({ text: "", fill: "FFFFFF", borders: { ...BORDERS_CELL, right: { style: BorderStyle.NONE } } }),
        makeCronoCell({ text: "", fill: "FFFFFF", borders: { ...BORDERS_CELL, left: { style: BorderStyle.NONE } } }),
      ],
    })
  );

  const cronoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        children: [
          createInstitutionalHeader(),
          new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }),
          cronoTable,
          new Paragraph({ spacing: { before: 300, after: 120 }, children: [] }),
          createSignatureBlock(
            {
              name: instructor.name || "DOCENTE DEL CURSO",
              title: "Docente / Instructor Academia CISCO",
              institution: "Facultad de Ingeniería en Ciencias Aplicadas",
            },
            {
              name: "MSc. Ludmila Starodub",
              title: "Coordinadora Academia CISCO",
              institution: "Universidad Técnica del Norte",
            }
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// ============================================================================
// 3. GENERADOR DE INFORME FINAL Y MEMORANDO DE CIERRE (DOCX)
// ============================================================================
export async function generateInformeFinalDocx(course) {
  const detail = course.Detail || {};
  const instructor = detail.Instructor || {};
  const participants = course.Participants || [];
  const payments = course.Payments || [];

  const totalHours = Number(detail.total_hours) || 70;
  const instructorHours = Number(detail.instructor_hours) || 50;
  const autonomousHours = Number(detail.activities_hours) || 20;
  const costPerHour = Number(detail.cost_per_hour) || 13.0;
  const teacherPay = (instructorHours * costPerHour).toFixed(2);

  // Estadísticas académicas
  const enrolledParticipants = participants.filter((p) => {
    return p.CourseParticipant?.enrolled !== undefined ? p.CourseParticipant.enrolled : p.enrolled;
  });
  const matriculadosCount = enrolledParticipants.length;
  const aprobadosCount = enrolledParticipants.filter((p) => {
    return p.CourseParticipant?.approval !== undefined ? p.CourseParticipant.approval : p.approval;
  }).length;
  const reprobadosCount = matriculadosCount - aprobadosCount;
  const approvalRate = matriculadosCount > 0 ? Math.round((aprobadosCount / matriculadosCount) * 100) : 0;

  // Estadísticas financieras
  let totalRecaudado = 0;
  if (payments && payments.length > 0) {
    totalRecaudado = payments.reduce((acc, pay) => acc + (Number(pay.total) || 0), 0);
  } else {
    totalRecaudado = participants.reduce((acc, p) => {
      const val =
        p.CourseParticipant?.total_payment !== null && p.CourseParticipant?.total_payment !== undefined
          ? p.CourseParticipant.total_payment
          : p.total_payment || 0;
      return acc + Number(val || 0);
    }, 0);
  }

  const saldoAFavor = (totalRecaudado - Number(teacherPay)).toFixed(2);

  // Tabla Anexo 2: Participantes
  const participantRows =
    enrolledParticipants.length > 0
      ? enrolledParticipants.map((p, idx) => {
          const cp = p.CourseParticipant || {};
          const nota = cp.practical_exam !== undefined && cp.practical_exam !== null ? Number(cp.practical_exam).toFixed(1) : "—";
          const isAprobado = cp.approval !== undefined ? cp.approval : p.approval;
          return [
            String(idx + 1),
            p.cid || "—",
            p.name || "Estudiante",
            p.email || "—",
            nota,
            isAprobado ? "APROBADO" : "REPROBADO",
          ];
        })
      : [["—", "—", "Sin participantes matriculados registrados en esta edición", "—", "—", "—"]];

  // Tabla Anexo 3: Facturación
  const billingRows =
    payments.length > 0
      ? payments.map((pay, idx) => [
          String(idx + 1),
          pay.invoice_number || `FAC-${idx + 1}`,
          formatDateShort(pay.invoice_date || pay.payment_date),
          pay.payer_cid_ruc || "—",
          pay.payer_name || "Comprobante",
          `$${Number(pay.subtotal || pay.total || 0).toFixed(2)}`,
          `$${Number(pay.iva || 0).toFixed(2)}`,
          `$${Number(pay.total || 0).toFixed(2)}`,
        ])
      : [["—", "—", "—", "—", "Sin comprobantes de recaudación registrados", "$0.00", "$0.00", "$0.00"]];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 },
          },
        },
        children: [
          createInstitutionalHeader(),

          // Bloque Memorando Oficial
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: `Memorando Nro. 004_AC_${new Date().getFullYear()}`,
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Ibarra, ${formatDate(new Date())}`,
                size: 19,
                font: "Arial",
              }),
            ],
          }),

          createKeyValueTable([
            ["PARA:", "Magíster Catalina Ramírez - DECANA FICA"],
            ["DE:", "MSc. Ludmila Vladimirovna Starodub Sauliak - COORDINADORA ACADEMIA CISCO FICA-UTN"],
            ["ASUNTO:", `Informe final del curso ${course.course_name} y trámite de pago docente`],
          ]),

          new Paragraph({
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: "De mi consideración:",
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
          }),

          createParagraph(
            `Le informo que el curso "${course.course_name}" realizado en el período comprendido del ${formatDate(
              course.start_date
            )} al ${formatDate(
              course.end_date
            )}, finalizó satisfactoriamente cumpliendo con la planificación y carga académica oficial de ${totalHours} horas reglamentarias.`
          ),

          createParagraph(
            `Adjunto la documentación de respaldo para que se autorice y proceda con el trámite del pago de $${teacherPay} USD ($${costPerHour.toFixed(
              2
            )} la hora incluido el IVA) a través de la empresa pública UEMPRENDE E.P. de la Universidad Técnica del Norte, al docente ${
              instructor.name || "designado"
            } por ${instructorHours} horas de clases dictadas con los fondos recaudados del curso.`
          ),

          new Paragraph({
            spacing: { before: 160, after: 300 },
            children: [
              new TextRun({
                text: "Por la gentil atención que se digne dar a la presente, le expreso mis sinceros agradecimientos.",
                size: 20,
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 40 },
            children: [
              new TextRun({
                text: "Atentamente,",
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 30 },
            children: [
              new TextRun({
                text: "Ing. Ludmila Vladimirovna Starodub Sauliak, MSc.",
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "COORDINADORA ACADEMIA CISCO FICA-UTN",
                bold: true,
                size: 19,
                color: COLOR_PRIMARY,
                font: "Arial",
              }),
            ],
          }),

          // ================= ANEXO 1 =================
          createSectionHeading("Anexo 1: Resumen Ejecutivo del Curso"),
          createKeyValueTable([
            ["Nombre del curso:", course.course_name],
            ["Período de ejecución:", `${formatDate(course.start_date)} al ${formatDate(course.end_date)}`],
            ["Modalidad:", "Híbrido (Clases virtuales síncronas + Prácticas presenciales Lab #4 FICA + NetAcad)"],
            ["Instructor responsable:", instructor.name || "Por designar"],
            ["Duración total del curso:", `${totalHours} horas académicas`],
            ["Horas dictadas por el instructor:", `${instructorHours} horas sincrónicas`],
            ["Horas de trabajo autónomo NetAcad:", `${autonomousHours} horas`],
            ["Costo hora clase instructor:", `$${costPerHour.toFixed(2)} USD (incluido el IVA)`],
            ["Número de participantes registrados:", String(participants.length)],
            ["Número de estudiantes matriculados oficiales:", String(matriculadosCount)],
            ["Número de estudiantes aprobados:", `${aprobadosCount} (${approvalRate}% de aprobación)`],
            ["Número de no aprobados / retirados:", String(reprobadosCount)],
            ["Total recaudado por matrículas (Tesorería):", `$ ${totalRecaudado.toFixed(2)} USD`],
            ["Total pago a docente instructor:", `$ ${teacherPay} USD`],
            ["Saldo a favor de la Academia CISCO / UTN:", `$ ${saldoAFavor} USD`],
          ]),

          // ================= ANEXO 2 =================
          createSectionHeading("Anexo 2: Nómina Oficial de Participantes y Rendimiento Académico"),
          createDataTable(
            ["N°", "Cédula / DNI", "Apellidos y Nombres", "Correo Electrónico", "Nota NetAcad", "Estado"],
            participantRows,
            [8, 16, 36, 22, 10, 8]
          ),

          // ================= ANEXO 3 =================
          createSectionHeading("Anexo 3: Reporte de Recaudación y Facturación"),
          createDataTable(
            ["N°", "Factura", "Fecha", "Cédula/RUC", "Nombre / Razón Social", "Subtotal", "IVA", "Total"],
            billingRows,
            [6, 12, 12, 16, 26, 10, 8, 10]
          ),

          // ================= SECCIONES EDITABLES =================
          createSectionHeading("Conclusiones y Recomendaciones del Curso"),
          createParagraph("Conclusiones pedagógicas:", true),
          createParagraph(
            "[Espacio para redacción de conclusiones: Se cumplieron los objetivos curriculares previstos con una destacada participación del estudiantado en los laboratorios prácticos y un índice de aprobación satisfactorio conforme a los estándares de la plataforma Cisco Networking Academy.]",
            false,
            true
          ),
          createParagraph("Recomendaciones de mejora:", true),
          createParagraph(
            "[Espacio para redacción de recomendaciones: Se recomienda mantener la disponibilidad horaria del laboratorio de redes #4 y continuar promoviendo la capacitación continua en las siguientes cohortes técnicas.]",
            false,
            true
          ),

          createSectionHeading("Certificación de Cumplimiento"),
          createSignatureBlock(
            {
              name: instructor.name || "DOCENTE DEL CURSO",
              title: "Instructor Cisco Networking Academy",
              institution: "Facultad de Ingeniería en Ciencias Aplicadas",
            },
            {
              name: "MSc. Ludmila Starodub",
              title: "Coordinadora Academia CISCO",
              institution: "Universidad Técnica del Norte",
            }
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

