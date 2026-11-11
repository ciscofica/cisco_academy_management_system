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
      timeZone: "UTC",
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
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
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
      dayIndex = d.getUTCDay();
      dayNum = d.getUTCDate();
      monthIndex = d.getUTCMonth();
      yearNum = d.getUTCFullYear();
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

  const templateDetail = course.TemplateCourse?.Detail || {};
  const totalHours = Number(detail.total_hours || templateDetail.total_hours) || 0;
  const instructorHours = Number(detail.instructor_hours || templateDetail.instructor_hours) || 0;
  const costPerHour = Number(detail.cost_per_hour) || 0;
  const estimatedPay = (instructorHours * costPerHour).toFixed(2);
  const modalityStr = modalities.map((m) => m.name).filter(Boolean).join(", ");

  let scheduleText = "";
  if (schedules.length > 0) {
    const formattedSchedules = schedules
      .map((s) => `${s.day_of_week || s.name || "Horario"}: ${s.start_time || ""} - ${s.end_time || ""}`.trim())
      .filter((str) => str.length > 3);
    if (formattedSchedules.length > 0) {
      scheduleText = formattedSchedules.join("\n");
    }
  }

  let costText = "";
  if (costs.length > 0) {
    costText = costs
      .map((c) => `${c.description || ""}: ${c.amount || ""}`.replace(/^: /, ""))
      .join("\n");
  }

  const generalInfoItems = [
    ["Nombre del curso:", course.course_name || "—"],
    ["Área temática:", detail.subject_area || detail.area || "—"],
    ["Duración total:", totalHours ? `${totalHours} horas` : ""],
    ["Modalidad:", modalityStr.toLowerCase()],
    ["Fecha de inicio y fin:", `${formatDate(course.start_date)} - ${formatDate(course.end_date)}`],
    ["Horario propuesto:", scheduleText],
    ["Dirigido a:", detail.target_audience || "—"],
    ["Número de participantes:", String(course.Participants?.length ?? "")],
    ["Costo:", costText],
    ["Formas de pago:", detail.payment_methods || templateDetail.payment_methods || ""],
    ["Responsable académico del curso:", detail.academic_responsible || templateDetail.academic_responsible || ""],
  ];

  // Temario curricular 100% dinámico desde la Base de Datos
  const chapterRows =
    chapters.length > 0
      ? chapters.map((ch, idx) => [
          String(idx + 1),
          ch.chapter_name || `Módulo ${idx + 1}`,
          ch.main_topics || "",
          String(ch.hours ?? ""),
          ch.modality || "",
        ])
      : [];

  const totalCalculatedHours = chapters.reduce((sum, ch) => sum + (Number(ch.hours) || 0), 0);
  chapterRows.push(["", "", "Total", String(totalCalculatedHours || totalHours || ""), ""]);

  const budgetRows = [
    ...(instructorHours && costPerHour ? [["Honorarios docentes", `$ ${estimatedPay}`, `$${costPerHour.toFixed(2)} por hora × ${instructorHours} horas`]] : []),
    ...costs.map((cost) => [cost.description || "Costo", cost.amount || "", ""]),
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
      createParagraph(detail.justification || templateDetail.justification || "", false),

          createSectionHeading("3. Objetivos del Curso"),
      createParagraph(`Objetivo general: ${detail.objective || templateDetail.objective || ""}`, false),
          createParagraph(`Objetivos específicos: ${detail.specific_objectives || templateDetail.specific_objectives || ""}`, false),

          createSectionHeading("4. Contenidos del Curso"),
          createDataTable(
            ["Módulo", "Título del Módulo", "Temas principales", "Horas estimadas", "Modalidad"],
            chapterRows,
            [10, 26, 44, 10, 10]
          ),

          createSectionHeading("5. Metodología de Enseñanza-Aprendizaje"),
      createParagraph(detail.methodology || templateDetail.methodology || "", false),

          createSectionHeading("6. Perfil del Docente o Equipo Docente que dictará el curso"),
          createParagraph(`Nombre: ${instructor.name || "—"}`, true),
          createParagraph("Formación académica:", true),
          ...createBlankSpace(3),
          createParagraph("Experiencia profesional y docente:", true),
          ...createBlankSpace(3),
          createParagraph("CV resumido (adjuntar):", true),
          ...createBlankSpace(3),

          createSectionHeading("7. Evaluación del Curso"),
      createParagraph(detail.evaluation_criteria || templateDetail.evaluation_criteria || "", false),
          createParagraph("Mecanismos de mejora continua:", true),
          ...createBlankSpace(4),

          createSectionHeading("8. Requerimientos Logísticos"),
          createParagraph("Aulas/espacios:", true),
          ...createBlankSpace(3),
      createParagraph(detail.resources_materials || templateDetail.resources_materials || "", false),
          createParagraph("Software:", true),
          ...createBlankSpace(3),

          createSectionHeading("9. Presupuesto Estimado (si aplica)"),
          createDataTable(["Rubro", "Monto estimado", "Observaciones"], budgetRows, [30, 20, 50]),

          createSectionHeading("10. Firma del Responsable"),
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: "Nombre: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: detail.academic_responsible || templateDetail.academic_responsible || "", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "Cargo: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: detail.academic_responsible_charge || templateDetail.academic_responsible_charge || "", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [
              new TextRun({ text: "Fecha presentación: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({
                text: formatDate(course.start_date) || "",
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
  const templateDetail = course.TemplateCourse?.Detail || {};
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

  if (!virtualSchedule) virtualSchedule = "";
  if (!presencialSchedule) presencialSchedule = "";

  // 2. Período oficial del curso
  let period = "";
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
  let shortCourseName = course.course_name || "";

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
          text: course.course_name || "",
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
  const inicioFormatted = course.start_date ? formatWeekdayDate(course.start_date, false) : "";
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
  const finalFormatted = course.end_date ? formatWeekdayDate(course.end_date, false) : "";
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
        makeCronoCell({ text: "Horas", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
        makeCronoCell({ text: "Modalidad", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
        makeCronoCell({ text: "Contenido / Horario", bold: true, align: AlignmentType.CENTER, fill: "B7B7B7", size: 19 }),
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
      const hours = Number(ch.hours) || 0;
      instructorHoursSum += hours;
      const isPresencial = (ch.modality || "").toLowerCase().includes("presencial");
      const rowFill = isPresencial ? "FFFF00" : "FFFFFF";

      const dateText = ch.start_date
        ? `${formatWeekdayDate(ch.start_date, true)}${ch.end_date && String(ch.end_date) !== String(ch.start_date) ? ` – ${formatWeekdayDate(ch.end_date, true)}` : ""}`
        : "";

      tableRows.push(
        new TableRow({
          children: [
            makeCronoCell({ text: String(idx + 1), align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({ text: dateText, align: AlignmentType.LEFT, fill: rowFill }),
              makeCronoCell({ text: String(hours || ""), align: AlignmentType.CENTER, fill: rowFill }),
            makeCronoCell({
              text: isPresencial ? "Presencial" : (ch.modality || ""),
              align: AlignmentType.CENTER,
              fill: rowFill,
            }),
            makeCronoCell({ text: [ch.chapter_name, ch.activity, [ch.session_start_time, ch.session_end_time].filter(Boolean).join("–")].filter(Boolean).join("\n"), align: AlignmentType.LEFT, fill: rowFill }),
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
          text: String(instructorHoursSum),
          bold: true,
          align: AlignmentType.CENTER,
          fill: "D9EAD3",
        }),
        makeCronoCell({ text: "", fill: "FFFFFF", borders: { ...BORDERS_CELL, right: { style: BorderStyle.NONE } } }),
        makeCronoCell({ text: "", fill: "FFFFFF", borders: { ...BORDERS_CELL, left: { style: BorderStyle.NONE } } }),
      ],
    })
  );

  // Horas autónomas registradas en la ficha de la edición.
  const actHours = Number(detail.activities_hours || 0);

  // Fila: Total horas curso (Verde suave)
  const grandTotal = instructorHoursSum + actHours;
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
              name: detail.academic_responsible || templateDetail.academic_responsible || "",
              title: detail.academic_responsible_charge || templateDetail.academic_responsible_charge || "",
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
// 3. GENERADOR DE INFORME FINAL DEL CURSO DE LA ACADEMIA CISCO (DOCX)
// ============================================================================
function createEvidencePlaceholder(title, description) {
  return [
    new Paragraph({
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 21,
          font: "Arial",
          color: "1e293b",
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.DASHED, size: 6, color: "94a3b8" },
        bottom: { style: BorderStyle.DASHED, size: 6, color: "94a3b8" },
        left: { style: BorderStyle.DASHED, size: 6, color: "94a3b8" },
        right: { style: BorderStyle.DASHED, size: 6, color: "94a3b8" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 500, after: 500 },
                  children: [
                    new TextRun({
                      text: description,
                      italics: true,
                      size: 19,
                      font: "Arial",
                      color: "64748b",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

export async function generateInformeFinalDocx(course) {
  const detail = course.Detail || {};
  const instructor = detail.Instructor || {};
  const participants = course.Participants || [];
  const chapters = course.Chapters || [];
  const template = course.TemplateCourse || {};
  const templateDetail = template.Detail || {};

  const totalHours = Number(detail.total_hours || templateDetail.total_hours) || 0;
  const instructorHours = Number(detail.instructor_hours || templateDetail.instructor_hours) || 0;
  const autonomousHours = Number(detail.activities_hours || templateDetail.activities_hours) || 0;

  // Participantes matriculados
  const enrolledParticipants = participants.filter((p) => {
    return Boolean(p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number);
  });
  const matriculadosCount = enrolledParticipants.length;

  // Fechas y semanas
  const monthsEs = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const formatEsDate = (d) => {
    if (!d || isNaN(d.getTime())) return "";
    return `${d.getUTCDate()}/${monthsEs[d.getUTCMonth()]}/${d.getUTCFullYear()}`;
  };

  // Tabla Tiempos y Cronograma
  const timelineTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: BORDER_LIGHT,
      bottom: BORDER_LIGHT,
      left: BORDER_LIGHT,
      right: BORDER_LIGHT,
      insideHorizontal: BORDER_LIGHT,
      insideVertical: BORDER_LIGHT,
    },
    rows: [
      new TableRow({
        children: [
          "FECHA",
          "HORARIO",
          "MODALIDAD",
          "SESIÓN / CONTENIDO",
          "NÚMERO DE ALUMNOS",
          "HORAS",
          "ACTIVIDAD",
        ].map((h) =>
          new TableCell({
            width: { size: 14, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 80 },
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    size: 16,
                    font: "Arial",
                    color: "1e293b",
                  }),
                ],
              }),
            ],
          })
        ),
      }),
      ...chapters.map((chapter) => new TableRow({
        children: [
          chapter.start_date ? formatEsDate(new Date(chapter.start_date)) : "",
          [chapter.session_start_time, chapter.session_end_time].filter(Boolean).join("–"),
          chapter.modality || "",
          [chapter.chapter_name, chapter.main_topics].filter(Boolean).join("\n"),
          String(matriculadosCount),
          String(Number(chapter.hours) || ""),
          chapter.activity || "",
        ].map((val) =>
          new TableCell({
            width: { size: 14, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: String(val),
                    size: 19,
                    font: "Arial",
                    color: "1f2937",
                  }),
                ],
              }),
            ],
          })
        ),
      })),
      // Fila Total
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            columnSpan: 5,
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: "Total horas clase-instructor:",
                    bold: true,
                    size: 19,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 14, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: String(instructorHours),
                    bold: true,
                    size: 20,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 16, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [new Paragraph({ children: [] })],
          }),
        ],
      }),
    ],
  });

  // Sección 4: Contenidos
  const modulesList =
    chapters && chapters.length > 0
      ? chapters.map((ch, idx) => ({
          name: ch.chapter_name?.toLowerCase().includes("módulo") || ch.chapter_name?.toLowerCase().includes("modulo")
            ? ch.chapter_name
            : `Módulo ${idx + 1}: ${ch.chapter_name}`,
          hours: ch.hours ?? "",
        }))
      : [];

  const contentRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              spacing: { before: 80, after: 80 },
              children: [new TextRun({ text: "TEMARIO", bold: true, size: 20, font: "Arial" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
              children: [new TextRun({ text: "HORAS CUMPLIDAS", bold: true, size: 20, font: "Arial" })],
            }),
          ],
        }),
      ],
    }),
    ...modulesList.map((m) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 80, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: m.name, size: 19, font: "Arial" })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: String(m.hours), size: 19, font: "Arial" })],
              }),
            ],
          }),
        ],
      })
    ),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: "Laboratorios presenciales", size: 19, font: "Arial" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: String(detail.lab_hours || "—"), size: 19, font: "Arial" })],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: "Total horas clase-instructor:", bold: true, size: 20, font: "Arial" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: String(instructorHours), bold: true, size: 20, font: "Arial" })],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: "Actividades en la plataforma virtual (Estudiante)", size: 19, font: "Arial" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: String(detail.activities_hours || autonomousHours || "—"), size: 19, font: "Arial" })],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: "Examen final del curso", size: 19, font: "Arial" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: "3", size: 19, font: "Arial" })],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 80, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: `Total horas curso ${course.course_name}:`, bold: true, size: 20, font: "Arial" })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: BORDER_LIGHT, bottom: BORDER_LIGHT, left: BORDER_LIGHT, right: BORDER_LIGHT },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: String(totalHours), bold: true, size: 20, font: "Arial" })],
            }),
          ],
        }),
      ],
    }),
  ];

  const contentsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: BORDER_LIGHT,
      bottom: BORDER_LIGHT,
      left: BORDER_LIGHT,
      right: BORDER_LIGHT,
      insideHorizontal: BORDER_LIGHT,
      insideVertical: BORDER_LIGHT,
    },
    rows: contentRows,
  });

  const englishName =
    template.course_name_en ||
    course.course_name;

  const className =
    course.class_code ||
    `UTN_${course.course_name.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase()}_${course.course_id}`;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 },
          },
        },
        children: [
          // Título Centrado
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: "INFORME FINAL DEL CURSO DE LA ACADEMIA CISCO",
                bold: true,
                size: 24,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `MÓDULO: ${course.course_name}`,
                bold: true,
                size: 22,
                font: "Arial",
                color: "1e293b",
              }),
            ],
          }),

          // 1. DATOS INFORMATIVOS
          new Paragraph({
            spacing: { before: 180, after: 100 },
            children: [
              new TextRun({
                text: "1.   DATOS INFORMATIVOS.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "CURSO: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: course.course_name, size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "NOMBRE EN INGLÉS: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: englishName, size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "NOMBRE CLASE: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: className, size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: "INSTRUCTOR: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: instructor.name || "", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "DURACIÓN: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: instructorHours ? `${instructorHours} horas` : "", size: 20, font: "Arial" }),
            ],
          }),

          new Paragraph({
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: "TIEMPOS Y CRONOGRAMA:",
                bold: true,
                size: 20,
                font: "Arial",
                color: "334155",
              }),
            ],
          }),

          timelineTable,

          // 2. OBJETIVO DEL CURSO
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [
              new TextRun({
                text: "2.   OBJETIVO DEL CURSO.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160, line: 260 },
            children: [
              new TextRun({
                text:
                  template.objective ||
                  detail.objective ||
                  "—",
                size: 20,
                font: "Arial",
                color: "1f2937",
              }),
            ],
          }),

          // 3. DESCRIPCIÓN GENERAL DEL CURSO
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "3.   DESCRIPCIÓN GENERAL DEL CURSO.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160, line: 260 },
            children: [
              new TextRun({
                text:
                  template.course_description ||
                  detail.course_description ||
                  "—",
                size: 20,
                font: "Arial",
                color: "1f2937",
              }),
            ],
          }),

          // 4. CONTENIDOS
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "4.   CONTENIDOS.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),

          contentsTable,

          // 5. METODOLOGÍA USADA
          new Paragraph({
            spacing: { before: 240, after: 80 },
            children: [
              new TextRun({
                text: "5.   METODOLOGÍA USADA.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 100, line: 260 }, children: [new TextRun({ text: detail.methodology || templateDetail.methodology || "", size: 20, font: "Arial", color: "1f2937" })] }),
          new Paragraph({
            spacing: { after: 160, line: 260 },
            children: [
              new TextRun({
                text: [instructorHours ? `${instructorHours} horas con instructor` : "", autonomousHours ? `${autonomousHours} horas autónomas` : ""].filter(Boolean).join(". "),
                size: 20,
                font: "Arial",
                color: "1f2937",
              }),
            ],
          }),

          // 6. RECURSOS
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "6.   RECURSOS.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80, line: 260 },
            children: [
              new TextRun({ text: "MATERIALES: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({ text: detail.resources_materials || templateDetail.resources_materials || "", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160, line: 260 },
            children: [
              new TextRun({ text: "MATERIALES: ", bold: true, size: 20, font: "Arial" }),
              new TextRun({
                text: detail.evaluation_criteria || templateDetail.evaluation_criteria || "",
                size: 20,
                font: "Arial",
              }),
            ],
          }),

          // 7. RESULTADOS Y CONCLUSIONES
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "7.   RESULTADOS Y CONCLUSIONES.",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100, line: 260 },
            children: [
              new TextRun({
                text: detail.justification || templateDetail.justification || "",
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100, line: 260 },
            children: [
              new TextRun({
                text: detail.specific_objectives || templateDetail.specific_objectives || "",
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          ...createBlankSpace(5),

          // 8. BIBLIOGRAFIA
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "8.   BIBLIOGRAFIA",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160, line: 260 },
            children: [
              new TextRun({
                text: detail.bibliography || templateDetail.bibliography || "",
                size: 20,
                font: "Arial",
              }),
            ],
          }),

          // 9. ASISTENCIA
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "9.   ASISTENCIA",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 160, line: 260 },
            children: [
              new TextRun({
                text: detail.participant_requeriment || templateDetail.participant_requeriment || "",
                size: 20,
                font: "Arial",
              }),
            ],
          }),

          // 10. EVALUACIÓN
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: "10.  EVALUACIÓN",
                bold: true,
                size: 22,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100, line: 260 },
            children: [
              new TextRun({
                text: detail.evaluation_criteria || templateDetail.evaluation_criteria || "",
                size: 20,
                font: "Arial",
              }),
            ],
          }),

          // Despedida y Firma
          new Paragraph({
            spacing: { before: 160, after: 120 },
            children: [
              new TextRun({ text: "Atentamente.", size: 20, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 60 },
            children: [
              new TextRun({
                text: "…………………………………………………………",
                size: 20,
                color: "64748b",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: instructor.name || "Ing. Docente Asignado",
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `CI: ${instructor.cid || instructor.dni || "—"}`, size: 19, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `email: ${instructor.email || "—"}`, size: 19, font: "Arial" }),
            ],
          }),
          new Paragraph({
            spacing: { after: 260 },
            children: [
              new TextRun({ text: `Cel: ${instructor.phone || "—"}`, size: 19, font: "Arial" }),
            ],
          }),

          // 11. ANEXOS (Espacios rotulados para adjuntar evidencias)
          new Paragraph({
            spacing: { before: 300, after: 140 },
            children: [
              new TextRun({
                text: "11.  ANEXOS",
                bold: true,
                size: 24,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),

          ...createEvidencePlaceholder(
            "Primera sesión virtual",
            "[Espacio para adjuntar captura de pantalla de la 1ra sesión síncrona virtual con estudiantes e instructor en Teams]"
          ),
          ...createEvidencePlaceholder(
            "Séptima sesión virtual",
            "[Espacio para adjuntar captura de pantalla del desarrollo de sesiones virtuales intermedias]"
          ),
          ...createEvidencePlaceholder(
            "Décima sesión virtual",
            "[Espacio para adjuntar captura de pantalla de sesiones avanzadas del currículo en línea]"
          ),
          ...createEvidencePlaceholder(
            "Décima tercera sesión virtual",
            "[Espacio para adjuntar captura de pantalla de la sesión de cierre y preparación de evaluaciones]"
          ),
          ...createEvidencePlaceholder(
            "Sesión presencial (Prácticas en Laboratorio FICA)",
            "[Espacio para adjuntar fotografías de las sesiones presenciales y laboratorios prácticos en los racks de redes]"
          ),
          ...createEvidencePlaceholder(
            "Calificaciones del Curso (Libro de Calificaciones NetAcad)",
            "[Espacio para adjuntar captura de pantalla del libro de calificaciones de la plataforma Cisco Networking Academy]"
          ),
          ...createEvidencePlaceholder(
            "Análisis del Curso y Encuesta de Satisfacción de Estudiantes",
            "[Espacio para adjuntar capturas y gráficos de las encuestas de fin de curso generadas por los estudiantes]"
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function createDocumentTitle(title, subtitle) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: `${title}${subtitle ? `\n${subtitle}` : ""}`, bold: true, size: 24, font: "Arial", color: COLOR_PRIMARY })] });
}

function getAcademicPeriod(start, end) {
  if (!start || !end) return "";
  const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
  const first = new Date(start); const last = new Date(end);
  if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime())) return "";
  return `${months[first.getUTCMonth()]} - ${months[last.getUTCMonth()]} ${last.getUTCFullYear()}`;
}

const formatDateDisplay = (value) => value ? formatDate(value) : "";

export async function generateReporteAprobadosDocx(course) {
  const detail = course.Detail || {};
  const instructor = detail.Instructor || {};
  const participants = course.Participants || [];

  const enrolledParticipants = participants.filter((p) => {
    return p.CourseParticipant?.enrolled && p.CourseParticipant?.invoice_number;
  });

  const approvedParticipants = participants.filter((p) => {
    const cp = p.CourseParticipant || {};
    return Boolean(cp.approval || (cp.grade_final !== null && parseFloat(cp.grade_final) >= 70.0) || cp.status_code === "P" || p.approval);
  });

  const totalAprobados = approvedParticipants.length;
  const totalMatriculados = enrolledParticipants.length || participants.length;
  const tasaAprobacion = totalMatriculados > 0 ? Math.round((totalAprobados / totalMatriculados) * 100) : 0;

  const approvedRows = approvedParticipants.map((p, idx) => {
    const cp = p.CourseParticipant || {};
    const grade = cp.grade_final !== null && cp.grade_final !== undefined ? `${parseFloat(cp.grade_final).toFixed(1)}/100` : "";
    const invoice = cp.invoice_number || "—";
    const degreeOrOrg = p.degree || p.institution || "";

    return [
      String(idx + 1),
      p.cid || "—",
      p.name || "—",
      degreeOrOrg,
      grade,
      "APROBADO (P)",
      invoice,
    ];
  });

  if (approvedRows.length === 0) {
    approvedRows.push(["—", "—", "Sin estudiantes aprobados registrados aún", "—", "—", "—", "—"]);
  }

  const doc = new Document({
    sections: [
      {
        children: [
          createDocumentTitle(
            "ACTA Y REPORTE DE ESTUDIANTES APROBADOS",
            `EDICIÓN: ${course.course_name?.toUpperCase() || "CURSO CISCO"}`
          ),

          createSectionHeading("1. Datos Generales de la Convocatoria"),
          createKeyValueTable([
            ["Programa / Curso:", course.course_name || "Curso Cisco"],
            ["Docente / Instructor:", instructor.name || "Por designar"],
            ["Periodo Académico:", getAcademicPeriod(course.start_date, course.end_date)],
            ["Fechas de Ejecución:", `${formatDateDisplay(course.start_date)} al ${formatDateDisplay(course.end_date)}`],
            ["Carga Horaria Oficial:", detail.total_hours ? `${detail.total_hours} Horas Académicas` : ""],
            ["Estado del Curso:", course.status || "En ejecución"],
          ]),

          createSectionHeading("2. Balance y Rendimiento de Aprobación"),
          createKeyValueTable([
            ["Total Estudiantes Inscritos:", `${participants.length} participantes`],
            ["Total Estudiantes Matriculados:", `${totalMatriculados} estudiantes oficiales`],
            ["Total Estudiantes Aprobados:", `${totalAprobados} estudiantes`],
            ["Tasa de Aprobación:", `${tasaAprobacion} %`],
            ["Criterio de Certificación:", detail.evaluation_criteria || course.TemplateCourse?.Detail?.evaluation_criteria || ""],
          ]),

          createSectionHeading("3. Nómina Oficial de Estudiantes Aprobados"),
          createDataTable(
            ["N°", "Cédula", "Nombres y Apellidos", "Carrera / Institución", "Nota Final", "Estado", "N° Factura"],
            approvedRows,
            [6, 14, 30, 20, 10, 10, 10]
          ),

          createSectionHeading("4. Firmas de Legalización y Acreditación"),
          createSignatureBlock(
            {
              name: instructor.name || "DOCENTE DEL CURSO",
              title: "Docente Instructor CISCO",
              institution: "Facultad de Ingeniería en Ciencias Aplicadas",
            },
            {
              name: "MSc. Ludmila Starodub",
              title: "Jefe de Laboratorio / Coordinadora CISCO",
              institution: "Universidad Técnica del Norte",
            }
          ),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

