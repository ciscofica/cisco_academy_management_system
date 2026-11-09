import Course from "../../models/Course.js";
import Cost from "../../models/Cost.js";
import Chapter from "../../models/Chapter.js";

import Participant from "../../models/Participant.js";
import ParticipantType from "../../models/ParticipantType.js";
import ParticipantPayment from "../../models/ParticipantPayment.js";
import ParticipantInfoUtn from "../../models/ParticipantInfo.js";
import Payment from "../../models/Payment.js";
import PaymentType from "../../models/PaymentType.js";
import InfoUtn from "../../models/InfoUtn.js";

// import notifications from "../../notifications.json" assert { type: "json" };
import fs from "fs";
// import path from "path";

const jsonPath = path.resolve("./src/notifications.json");
const notifications = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

import { Op } from "sequelize";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

import Detail from "../../models/Detail.js";
import XLSX from "xlsx";
import DetailValues from "../../models/DetailValues.js";
import Instructor from "../../models/Instructor.js";
import Certificate from "../../models/Certificate.js";
import Modality from "../../models/Modality.js";
import Schedule from "../../models/Schedule.js";
import CourseChapter from "../../models/CourseChapter.js";
import CourseParticipant from "../../models/CourseParticipant.js";
import DetailModality from "../../models/DetailModality.js";
import DetailSchedule from "../../models/DetailSchedule.js";
import DetailCost from "../../models/DetailCost.js";
import {
  generatePlanificacionDocx,
  generateCronogramaDocx,
  generateInformeFinalDocx,
  generateReporteAprobadosDocx,
} from "../../services/courseDocxService.js";

export const getAllCourses = async (req, res) => {
  try {
    const { search = "", limit = 10, page = 1 } = req.body;
    const offset = (page - 1) * limit;

    const courses = await Course.findAndCountAll({
      where: {
        status: { [Op.ne]: 'Plantilla' }, // Excluir plantillas del listado normal
        [Op.or]: [
          { course_name: { [Op.like]: `%${search}%` } }, // Buscar por nombre del curso
          // ! falta establecer las relaciones necesarias para que busque en todas esas columnas
          //   { description: { [Op.like]: `%${search}%` } }, // Buscar por descripción
          //   { '$CourseParticipant.Participant.name$': { [Op.like]: `%${search}%` } }, // Buscar por nombre del participante
          //   { '$CourseParticipant.Participant.InfoUtn.info$': { [Op.like]: `%${search}%` } }, // Buscar en InfoUtn relacionado al participante
          //   { '$CourseDetail.Detail.name$': { [Op.like]: `%${search}%` } }, // Buscar en detalles del curso
          //   { '$Instructor.name$': { [Op.like]: `%${search}%` } }, // Buscar por nombre del instructor
          // Agregar más búsquedas en columnas de relaciones según sea necesario
        ],
      },
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          attributes: ["course_id", "course_name"],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
        {
          model: Participant,
          include: [
            { model: ParticipantType },
            { model: InfoUtn, through: { attributes: [] } },
            {
              model: Payment,
              through: { attributes: [] },
              include: [
                {
                  model: PaymentType,
                },
              ],
            },
          ],
        },
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [
            { model: DetailValues },
            {
              model: Instructor,
              include: [
                {
                  model: Certificate,
                  through: { attributes: [] },
                },
              ],
            },
            {
              model: Modality,
              through: { attributes: [] }, // Excluye los campos de la tabla intermedia
            },
            {
              model: Schedule,
              through: { attributes: [] },
            },
            {
              model: Cost,
              through: { attributes: [] },
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      total: courses.count,
      totalPages: Math.ceil(courses.count / limit),
      courses: courses.rows,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Error al obtener los cursos",
      error,
    });
  }
};

export const addCourse = async (req, res) => {
  try {
    const {
      course_name,
      start_registration_date,
      end_registration_date,
      start_enrollment_date,
      end_enrollment_date,
      start_date,
      end_date,
      status,
    } = req.body;

    const courseExists = await Course.findOne({ where: { course_name } });

    if (courseExists) {
      return res.status(400).json({ message: notifications.cursos.c1 });
    }

    const newCourse = await Course.create({
      course_name,
      start_registration_date,
      end_registration_date,
      start_enrollment_date,
      end_enrollment_date,
      start_date,
      end_date,
      status,
    });

    return res
      .status(201)
      .json({ message: notifications.cursos.c4, course: newCourse });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: notifications.principal.p1 });
  }
};

// export const getAllCourses = async (req, res) => {
//   try {
//     const users = await Course.findAll();
//     return res.status(200).json(users);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Error al obtener los usuarios", error });
//   }
// };

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk({
      id,
      include: [
        {
          model: Chapter,
          through: { attributes: [] },
        },
        {
          model: Participant,
          include: [
            { model: ParticipantType },
            { model: InfoUtn, through: { attributes: [] } },
            {
              model: Payment,
              through: { attributes: [] },
              include: [
                {
                  model: PaymentType,
                },
              ],
            },
          ],
        },
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [
            { model: DetailValues },
            {
              model: Instructor,
              include: [
                {
                  model: Certificate,
                  through: { attributes: [] },
                },
              ],
            },
            {
              model: Modality,
              through: { attributes: [] }, // Excluye los campos de la tabla intermedia
            },
            {
              model: Schedule,
              through: { attributes: [] },
            },
            {
              model: Cost,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: notifications.cursos.c5 });
    }

    return res.status(200).json({ course: course });
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const inactiveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    let status = "";
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: notifications.cursos.c5 });
    }
    if (course.status == "Activo") {
      status = "Inactivo";
    } else {
      status = "Activo";
    }
    await course.update({ status: status });

    return res.status(200).json({ message: notifications.cursos.c3 });
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: notifications.cursos.c5 });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    const updatedFields = {};

    for (const field in req.body) {
      if (Course.rawAttributes[field]) {
        updatedFields[field] = req.body[field];
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    await course.update(updatedFields);

    return res.status(200).json({ message: notifications.cursos.c4, course });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const getCoursesDropdown = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["course_id", "course_name"],
    });
    res.json({ courses: courses });
  } catch (error) {
    res.status(500).json({ message: notifications.principal.p1 });
  }
};

export const getCourseTemplates = async (req, res) => {
  try {
    const templates = await Course.findAll({
      where: {
        status: "Plantilla",
      },
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [
            { model: Instructor },
            { model: Modality, through: { attributes: [] } },
            { model: Schedule, through: { attributes: [] } },
            { model: Cost, through: { attributes: [] } },
            { model: DetailValues },
          ],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
      ],
      order: [["course_name", "ASC"], [Chapter, CourseChapter, "sort_order", "ASC"], [Chapter, CourseChapter, "course_chapter_id", "ASC"]],
    });

    return res.json(templates);
  } catch (error) {
    console.error("Error al obtener plantillas de cursos:", error);
    return res.status(500).json({
      message: "Error al obtener plantillas de cursos.",
      error: error.message,
    });
  }
};

const catalogDetailFields = ["course_description", "course_name_en", "course_code", "objective", "specific_objectives", "justification", "subject_area", "target_audience", "prerequisites", "methodology", "evaluation_criteria", "resources_materials", "bibliography", "payment_methods", "academic_responsible", "academic_responsible_charge", "total_hours", "instructor_hours", "activities_hours", "participant_requeriment"];

export const saveCourseTemplate = async (req, res) => {
  try {
    const { course_name, ...values } = req.body;
    if (!String(course_name || "").trim()) return res.status(400).json({ message: "Ingrese el nombre del curso." });
    const detailValues = Object.fromEntries(catalogDetailFields.filter((key) => values[key] !== undefined).map((key) => [key, values[key]]));
    let template;
    if (req.params.id) {
      template = await Course.findOne({ where: { course_id: req.params.id, status: "Plantilla" }, include: [{ model: Detail }] });
      if (!template) return res.status(404).json({ message: "Curso de catálogo no encontrado." });
      await template.update({ course_name: String(course_name).trim() });
      if (template.Detail) await template.Detail.update(detailValues);
      else template.detail_id = (await Detail.create({ course_description: "", ...detailValues })).detail_id;
      await template.save();
    } else {
      const detail = await Detail.create({ course_description: "", ...detailValues });
      template = await Course.create({ course_name: String(course_name).trim(), status: "Plantilla", detail_id: detail.detail_id, created_by: req.user?.id || null });
    }
    const result = await Course.findByPk(template.course_id, { include: [{ model: Detail }, { model: Chapter, through: { attributes: [] } }] });
    return res.status(req.params.id ? 200 : 201).json({ template: result });
  } catch (error) {
    console.error("Error guardando catálogo:", error);
    return res.status(500).json({ message: "No se pudo guardar el curso del catálogo.", error: error.message });
  }
};

export const exportCoursePaymentsExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Curso no encontrado." });
    const payments = await Payment.findAll({ where: { course_id: id }, order: [["invoice_date", "ASC"], ["invoice_number", "ASC"]] });
    const rows = payments.map((p) => [p.invoice_number || "", p.invoice_date || "", p.payer_cid_ruc || "", p.payer_name || "", "", "", "", Number(p.subtotal || 0), Number(p.iva || 0), Number(p.amount || 0), p.project_code || ""]);
    rows.push(["", "", "", "TOTALES", "", "", "", payments.length ? { t: "n", f: `SUM(H3:H${payments.length + 2})` } : 0, payments.length ? { t: "n", f: `SUM(I3:I${payments.length + 2})` } : 0, payments.length ? { t: "n", f: `SUM(J3:J${payments.length + 2})` } : 0, ""]);
    const sheet = XLSX.utils.aoa_to_sheet([[`REPORTE DE FACTURACIÓN - ${course.course_name}`], ["FACTURA", "FECHA", "RUC", "APELLIDOS / EMPRESA", "NOMBRE", "CANT.", "VALOR U.", "V. TOTAL", "IVA", "TOTAL", "PROYECTO 0607"], ...rows]);
    sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
    sheet["!cols"] = [14, 13, 18, 30, 22, 9, 12, 13, 12, 13, 14].map((wch) => ({ wch }));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Facturación");
    const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Facturacion_${id}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error("Error generando facturación:", error);
    return res.status(500).json({ message: "No se pudo generar el Excel de facturación." });
  }
};

export const exportCourseParticipantsExcel = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, { include: [{ model: Participant, include: [{ model: ParticipantType }] }] });
    if (!course) return res.status(404).json({ message: "Curso no encontrado." });
    const participants = course.Participants || [];
    const rows = participants.map((p) => {
      const cp = p.CourseParticipant || {};
      return [p.name || "", p.cid || "", p.phone || "", p.ParticipantType?.name || "", cp.enrolled ? "Matriculado" : "Inscrito", cp.grade_final ?? "", cp.approval ? "Aprobado" : (cp.status_code || ""), Number(cp.total_payment || 0), p.certificate_required ? "Sí" : "No"];
    });
    const sheet = XLSX.utils.aoa_to_sheet([[`NÓMINA Y CALIFICACIONES - ${course.course_name}`], ["PARTICIPANTE", "CÉDULA", "TELÉFONO", "TIPO", "ESTADO", "NOTA FINAL", "RESULTADO", "PAGO TOTAL", "CERTIFICADO"], ...rows]);
    sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
    sheet["!cols"] = [30, 16, 16, 26, 16, 12, 14, 14, 14].map((wch) => ({ wch }));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Participantes");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Participantes_${course.course_id}.xlsx`);
    return res.send(XLSX.write(book, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.error("Error generando nómina Excel:", error);
    return res.status(500).json({ message: "No se pudo generar el Excel de participantes." });
  }
};

export const getCourseTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Course.findOne({
      where: {
        course_id: id,
        status: "Plantilla",
      },
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [
            { model: Instructor },
            { model: Modality, through: { attributes: [] } },
            { model: Schedule, through: { attributes: [] } },
            { model: Cost, through: { attributes: [] } },
            { model: DetailValues },
          ],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
      ],
    });

    if (!template) {
      return res.status(404).json({ message: "Plantilla de curso no encontrada." });
    }

    return res.status(200).json(template);
  } catch (error) {
    console.error("Error al obtener plantilla:", error);
    return res.status(500).json({
      message: "Error al obtener la plantilla del curso.",
      error: error.message,
    });
  }
};

export const startCourseFromTemplate = async (req, res) => {
  try {
    const {
      template_course_id,
      period,
      start_date,
      end_date,
      start_registration_date,
      end_registration_date,
      start_enrollment_date,
      end_enrollment_date,
      status,
      instructor_id,
      class_code,
      modality_ids,
      schedule_ids,
      cost_ids,
    } = req.body;

    if (!template_course_id) {
      return res.status(400).json({
        message: "Debe seleccionar un curso base del catálogo.",
      });
    }

    if (!period) {
      return res.status(400).json({
        message: "Debe ingresar el periodo del curso (ej: ENE-MARZO2026).",
      });
    }

    const templateCourse = await Course.findOne({
      where: {
        course_id: template_course_id,
        status: "Plantilla",
      },
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [
            { model: Modality },
            { model: Schedule },
            { model: Cost },
            { model: DetailValues },
          ],
        },
        {
          model: Chapter,
        },
      ],
    });

    if (!templateCourse) {
      return res.status(404).json({
        message: "No se encontró el curso base seleccionado o no es una plantilla válida.",
      });
    }

    // 1. Clona/Crea una instancia de Detail específica para esta edición (SIEMPRE garantizado)
    const tplDet = templateCourse.Detail;
    const newDetail = await Detail.create({
      instructor_id: instructor_id ? Number(instructor_id) : null,
      course_description: tplDet?.course_description || "",
      total_hours: tplDet?.total_hours ?? null,
      instructor_hours: tplDet?.instructor_hours ?? null,
      activities_hours: tplDet?.activities_hours ?? null,
      cost_per_hour: tplDet?.cost_per_hour ?? null,
      participant_requeriment: tplDet?.participant_requeriment || "",
      ...Object.fromEntries(catalogDetailFields.filter((key) => tplDet?.[key] !== undefined && key !== "course_description").map((key) => [key, tplDet[key]])),
      num_registered: 0,
      num_enrolled: 0,
      num_failed: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Asignar modalidades elegidas por el usuario
    const finalModalityIds =
      modality_ids && modality_ids.length > 0
        ? modality_ids
        : (tplDet?.Modalities || []).map((m) => m.modality_id);
    if (finalModalityIds.length > 0) {
      await DetailModality.bulkCreate(
        finalModalityIds.map((mid) => ({
          detail_id: newDetail.detail_id,
          modality_id: Number(mid),
          created_at: new Date(),
          updated_at: new Date(),
        }))
      );
    }

    // Horarios seleccionados por el usuario
    if (schedule_ids && schedule_ids.length > 0) {
      await DetailSchedule.bulkCreate(
        schedule_ids.map((sid) => ({
          detail_id: newDetail.detail_id,
          schedule_id: Number(sid),
          created_at: new Date(),
          updated_at: new Date(),
        }))
      );
    }

    // Costos
    const finalCostIds =
      cost_ids && cost_ids.length > 0
        ? cost_ids
        : (tplDet?.Costs || []).map((c) => c.cost_id);
    if (finalCostIds.length > 0) {
      await DetailCost.bulkCreate(
        finalCostIds.map((cid) => ({
          detail_id: newDetail.detail_id,
          cost_id: cid,
          created_at: new Date(),
          updated_at: new Date(),
        }))
      );
    }

    // 2. Determinar nombre o código oficial de la clase según estándar UTN
    const courseName = class_code?.trim() || `${templateCourse.course_name} - ${period}`;

    const cleanDate = (d) => {
      if (!d || d === "" || d === "Invalid date" || d === "null" || d === "undefined") return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // 3. Crear el registro del Curso / Edición
    const newCourse = await Course.create({
      course_name: courseName,
      class_code: class_code?.trim() || null,
      start_date: cleanDate(start_date),
      end_date: cleanDate(end_date),
      status: status || "Planificado",
      created_at: new Date(),
      updated_at: new Date(),
      created_by: req.user?.id || templateCourse.created_by || null,
      start_registration_date: cleanDate(start_registration_date),
      end_registration_date: cleanDate(end_registration_date),
      start_enrollment_date: cleanDate(start_enrollment_date),
      end_enrollment_date: cleanDate(end_enrollment_date),
      detail_id: newDetail ? newDetail.detail_id : null,
      template_course_id: templateCourse.course_id,
    });

    // 4. Copiar el contenido curricular a capítulos propios de esta edición.
    // Las fechas y horas de sesión pertenecen a la edición, nunca al catálogo.
    if (templateCourse.Chapters && templateCourse.Chapters.length > 0) {
      const orderedChapters = [...templateCourse.Chapters].sort((a, b) =>
        (Number(a.CourseChapter?.sort_order) || Number(a.CourseChapter?.course_chapter_id) || 0)
        - (Number(b.CourseChapter?.sort_order) || Number(b.CourseChapter?.course_chapter_id) || 0)
      );
      for (const ch of orderedChapters) {
        const editionChapter = await Chapter.create({
          chapter_name: ch.chapter_name,
          hours: ch.hours,
          main_topics: ch.main_topics,
          modality: ch.modality,
          activity: ch.activity,
          start_date: null,
          end_date: null,
          session_start_time: null,
          session_end_time: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
        await CourseChapter.create({
          course_id: newCourse.course_id,
          chapter_id: editionChapter.chapter_id,
          sort_order: ch.CourseChapter?.sort_order ?? ch.CourseChapter?.course_chapter_id ?? 0,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // 5. Cargar la edición completa para responder
    const createdEdition = await Course.findByPk(newCourse.course_id, {
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          attributes: ["course_id", "course_name"],
        },
        {
          model: Detail,
          include: [
            { model: Instructor },
            { model: Modality, through: { attributes: [] } },
            { model: Schedule, through: { attributes: [] } },
            { model: Cost, through: { attributes: [] } },
          ],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
      ],
    });

    return res.status(201).json({
      message: "Edición iniciada correctamente desde la plantilla de catálogo.",
      course: createdEdition,
    });
  } catch (error) {
    console.error("Error al iniciar curso desde plantilla:", error);
    return res.status(500).json({
      message: "Error al iniciar curso desde plantilla.",
      error: error.message,
    });
  }
};

export const updateCourseEdition = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      course_name,
      class_code,
      instructor_id,
      modality_id,
      start_date,
      end_date,
      start_registration_date,
      end_registration_date,
      status,
      total_hours,
      instructor_hours,
      activities_hours,
      cost_per_hour,
    } = req.body;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const cleanDate = (d) => {
      if (!d || d === "" || d === "Invalid date" || d === "null" || d === "undefined") return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    if (course_name) course.course_name = course_name;
    if (class_code !== undefined) course.class_code = class_code?.trim() || null;
    if (start_date !== undefined) course.start_date = cleanDate(start_date);
    if (end_date !== undefined) course.end_date = cleanDate(end_date);
    if (start_registration_date !== undefined) course.start_registration_date = cleanDate(start_registration_date);
    if (end_registration_date !== undefined) course.end_registration_date = cleanDate(end_registration_date);
    if (status) course.status = status;
    course.updated_at = new Date();
    await course.save();

    let detail = null;
    if (course.detail_id) {
      detail = await Detail.findByPk(course.detail_id);
    }

    if (!detail) {
      detail = await Detail.create({
        instructor_id: instructor_id ? Number(instructor_id) : null,
        course_description: "",
        total_hours: total_hours ?? null,
        instructor_hours: instructor_hours ?? null,
        activities_hours: activities_hours ?? null,
        cost_per_hour: cost_per_hour ?? null,
        num_registered: 0,
        num_enrolled: 0,
        num_failed: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      course.detail_id = detail.detail_id;
      await course.save();
    } else {
      if (instructor_id !== undefined) {
        detail.instructor_id = instructor_id ? Number(instructor_id) : null;
      }
      if (total_hours !== undefined) detail.total_hours = total_hours;
      if (instructor_hours !== undefined) detail.instructor_hours = instructor_hours;
      if (activities_hours !== undefined) detail.activities_hours = activities_hours;
      if (cost_per_hour !== undefined) detail.cost_per_hour = cost_per_hour;
      detail.updated_at = new Date();
      await detail.save();
    }

    if (modality_id) {
      await DetailModality.destroy({ where: { detail_id: detail.detail_id } });
      await DetailModality.create({
        detail_id: detail.detail_id,
        modality_id: Number(modality_id),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    const updated = await Course.findByPk(id, {
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          attributes: ["course_id", "course_name"],
        },
        {
          model: Detail,
          include: [
            { model: DetailValues },
            {
              model: Instructor,
              include: [
                { model: Certificate, through: { attributes: [] } },
              ],
            },
            { model: Modality, through: { attributes: [] } },
            { model: Schedule, through: { attributes: [] } },
            { model: Cost, through: { attributes: [] } },
          ],
        },
        {
          model: Participant,
          include: [
            { model: ParticipantType },
            {
              model: Payment,
              where: { course_id: id },
              required: false,
              through: { attributes: [] },
              include: [{ model: PaymentType }],
            },
          ],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
      ],
    });

    return res.status(200).json({
      message: "Edición del curso actualizada exitosamente.",
      course: updated,
    });
  } catch (error) {
    console.error("Error al actualizar edición del curso:", error);
    return res.status(500).json({
      message: "Error al actualizar edición del curso.",
      error: error.message,
    });
  }
};

export const getCourseExpedient = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({
      where: { course_id: id, status: { [Op.ne]: 'Plantilla' } },
      order: [[Chapter, CourseChapter, "sort_order", "ASC"], [Chapter, CourseChapter, "course_chapter_id", "ASC"]],
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          attributes: ["course_id", "course_name", "detail_id"],
          include: [{ model: Detail }],
        },
        {
          model: Detail,
          include: [
            { model: DetailValues },
            {
              model: Instructor,
              include: [
                { model: Certificate, through: { attributes: [] } },
              ],
            },
            { model: Modality, through: { attributes: [] } },
            { model: Schedule, through: { attributes: [] } },
            { model: Cost, through: { attributes: [] } },
          ],
        },
        {
          model: Participant,
          include: [
            { model: ParticipantType },
            {
              model: Payment,
              where: { course_id: id },
              required: false,
              through: { attributes: [] },
              include: [{ model: PaymentType }],
            },
          ],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado o es una plantilla." });
    }

    return res.status(200).json({ course });
  } catch (error) {
    console.error("Error al obtener expediente del curso:", error);
    return res.status(500).json({ message: "Error al obtener expediente del curso.", error: error.message });
  }
};

export const getCoursesReport = async (req, res) => {
  try {
    const { status: filterStatus } = req.query;

    const whereClause = { status: { [Op.ne]: 'Plantilla' } };
    if (filterStatus && filterStatus !== 'Todos') {
      whereClause.status = filterStatus;
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          attributes: ["course_id", "course_name"],
        },
        {
          model: Detail,
          include: [
            { model: Instructor },
            { model: Modality, through: { attributes: [] } },
          ],
        },
      ],
      order: [["start_date", "DESC"]],
    });

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("Error al obtener reporte de cursos:", error);
    return res.status(500).json({ message: "Error al obtener reporte de cursos.", error: error.message });
  }
};

export const getCourseParticipantsReport = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      where: { course_id: id, status: { [Op.ne]: 'Plantilla' } },
      include: [
        {
          model: Participant,
          include: [
            { model: ParticipantType },
            { model: InfoUtn, through: { attributes: [] } },
            {
              model: Payment,
              through: { attributes: [] },
              include: [{ model: PaymentType }],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    return res.status(200).json({
      course_name: course.course_name,
      course_id: course.course_id,
      status: course.status,
      participants: course.Participants || [],
    });
  } catch (error) {
    console.error("Error al obtener reporte de participantes:", error);
    return res.status(500).json({ message: "Error al obtener reporte de participantes.", error: error.message });
  }
};

export const enrollCourseParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      participant_id,
      name,
      cid,
      email,
      phone,
      address,
      institution,
      participant_type_id,
      info_utn_id,
      degree,
      degree_level,
      total_payment,
      enrolled = true,
      registered = true,
    } = req.body;

    const course = await Course.findByPk(id, {
      include: [{ model: Detail }],
    });
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    let participant = null;

    if (participant_id) {
      participant = await Participant.findByPk(participant_id);
      if (!participant) {
        return res.status(404).json({ message: "Participante no encontrado." });
      }
      // Actualizar datos de contacto/carrera si fueron suministrados y no estaban establecidos
      let needsSave = false;
      if (email && !participant.email) { participant.email = email; needsSave = true; }
      if (degree && !participant.degree) { participant.degree = degree; needsSave = true; }
      if (degree_level && !participant.degree_level && /^\d+$/.test(String(degree_level))) { participant.degree_level = parseInt(degree_level, 10); needsSave = true; }
      if (phone && (!participant.phone || participant.phone === "sin registro")) { participant.phone = phone; needsSave = true; }
      if (address && (!participant.address || participant.address === "sin registro")) { participant.address = address; needsSave = true; }
      if (institution && (!participant.institution || participant.institution === "sin registro")) { participant.institution = institution; needsSave = true; }
      if (needsSave) await participant.save();
    } else if (cid) {
      participant = await Participant.findOne({ where: { cid } });
      if (!participant) {
        participant = await Participant.create({
          name: name || "Nuevo Participante",
          cid,
          email: email || null,
          phone: phone || "",
          address: address || "",
          institution: institution || "",
          participant_type_id: participant_type_id || 1,
          degree: degree || null,
          degree_level: /^\d+$/.test(String(degree_level || "")) ? parseInt(degree_level, 10) : null,
          enrolled: false,
          registered: true,
          approval: false,
          total_payment: total_payment || 0.0,
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      if (info_utn_id) await ParticipantInfoUtn.findOrCreate({ where: { participant_id: participant.participant_id, info_utn_id: Number(info_utn_id) } });
    } else {
      return res.status(400).json({ message: "Debe proveer una cédula o ID de participante." });
    }

    const existing = await CourseParticipant.findOne({
      where: {
        course_id: id,
        participant_id: participant.participant_id,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "El estudiante ya se encuentra registrado en esta edición del curso.",
      });
    }

    const hasInvoice = Boolean(req.body.invoice_number && String(req.body.invoice_number).trim());
    const isEnrolled = enrolled !== undefined ? Boolean(enrolled) : hasInvoice;

    await CourseParticipant.create({
      course_id: id,
      participant_id: participant.participant_id,
      total_payment: total_payment ? parseFloat(total_payment) : 0.0,
      invoice_number: hasInvoice ? String(req.body.invoice_number).trim() : null,
      enrolled: isEnrolled,
      approval: false,
      grade_final: null,
      status_code: "I",
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (course.Detail) {
      const curEnrolled = course.Detail.num_enrolled || 0;
      const curRegistered = course.Detail.num_registered || 0;
      await course.Detail.update({
        num_enrolled: isEnrolled ? curEnrolled + 1 : curEnrolled,
        num_registered: curRegistered + 1,
        updated_at: new Date(),
      });
    }

    return res.status(200).json({
      message: "Estudiante matriculado exitosamente en esta edición.",
      participant,
    });
  } catch (error) {
    console.error("Error al matricular participante:", error);
    return res.status(500).json({
      message: "Error al matricular estudiante.",
      error: error.message,
    });
  }
};

export const enrollCourseParticipantsBulk = async (req, res) => {
  try {
    const { id } = req.params;
    const { participants = [] } = req.body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron estudiantes para matricular." });
    }

    const course = await Course.findByPk(id, {
      include: [{ model: Detail }],
    });
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    let newlyEnrolledCount = 0;
    let alreadyEnrolledCount = 0;
    const errors = [];

    const getTypeId = (tipoStr) => {
      if (!tipoStr) return 1;
      const lower = String(tipoStr).toLowerCase();
      if (lower.includes("egresad") || lower.includes("graduad")) return 2;
      if (lower.includes("postgrad")) return 3;
      if (lower.includes("particul") || lower.includes("extern") || lower.includes("public")) return 4;
      if (lower.includes("docent")) return 5;
      return 1;
    };

    for (const item of participants) {
      try {
        const rawCid = item.cid || item.cedula || item.dni;
        if (!rawCid) {
          errors.push({ item, error: "Fila omitida: falta número de cédula." });
          continue;
        }

        const cidNum = parseInt(String(rawCid).replace(/\D/g, ""), 10);
        if (!cidNum || isNaN(cidNum)) {
          errors.push({ item, error: `Cédula inválida: ${rawCid}` });
          continue;
        }

        const name = item.name || item.nombres || item.apellidos_y_nombres || "Sin Nombre";
        const email = item.email || item.correo || null;
        const phone = item.phone || item.telefono || item.celular || "sin registro";
        const address = item.address || item.ciudad || "sin registro";
        const institution = item.institution || item.empresa || "sin registro";
        const degree = item.degree || item.carrera || null;
        const degreeLevel = item.degree_level || item.nivel || null;
        const parsedLevel = degreeLevel ? parseInt(degreeLevel, 10) : null;
        const typeId = item.participant_type_id || getTypeId(item.tipo || item.type);

        // 1. Buscar o crear Participante
        let participant = await Participant.findOne({ where: { cid: cidNum } });
        if (!participant) {
          participant = await Participant.create({
            name,
            cid: cidNum,
            email,
            phone,
            address,
            institution,
            participant_type_id: typeId,
            degree,
            degree_level: parsedLevel,
            enrolled: false,
            registered: true,
            approval: false,
            total_payment: 0.0,
            active: true,
            created_at: new Date(),
            updated_at: new Date(),
          });
        } else {
          // Actualizar datos de contacto si no existían
          let updated = false;
          if (email && !participant.email) { participant.email = email; updated = true; }
          if (degree && !participant.degree) { participant.degree = degree; updated = true; }
          if (parsedLevel && !participant.degree_level) { participant.degree_level = parsedLevel; updated = true; }
          if (phone && phone !== "sin registro" && (!participant.phone || participant.phone === "sin registro")) { participant.phone = phone; updated = true; }
          if (address && address !== "sin registro" && (!participant.address || participant.address === "sin registro")) { participant.address = address; updated = true; }
          if (institution && institution !== "sin registro" && (!participant.institution || participant.institution === "sin registro")) { participant.institution = institution; updated = true; }
          if (updated) await participant.save();
        }

        // 2. Comprobar si ya está registrado en este curso
        const existing = await CourseParticipant.findOne({
          where: {
            course_id: id,
            participant_id: participant.participant_id,
          },
        });

        if (existing) {
          alreadyEnrolledCount++;
          continue;
        }

        // 3. Crear relación en esta edición (por defecto Inscrito, NO matriculado hasta factura)
        await CourseParticipant.create({
          course_id: id,
          participant_id: participant.participant_id,
          total_payment: 0.0,
          invoice_number: null,
          enrolled: false,
          approval: false,
          grade_final: null,
          status_code: "I",
          created_at: new Date(),
          updated_at: new Date(),
        });

        newlyEnrolledCount++;
      } catch (rowErr) {
        errors.push({ item, error: rowErr.message });
      }
    }

    // 4. Actualizar contadores del curso: incrementa num_registered (pendientes de facturación)
    if (newlyEnrolledCount > 0 && course.Detail) {
      const curRegistered = course.Detail.num_registered || 0;
      await course.Detail.update({
        num_registered: curRegistered + newlyEnrolledCount,
        updated_at: new Date(),
      });
    }

    return res.status(200).json({
      message: `Proceso completado: ${newlyEnrolledCount} matriculados exitosamente, ${alreadyEnrolledCount} ya estaban inscritos.`,
      newlyEnrolledCount,
      alreadyEnrolledCount,
      errorsCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Error en carga masiva de participantes:", error);
    return res.status(500).json({
      message: "Error al procesar la carga masiva.",
      error: error.message,
    });
  }
};

export const removeCourseParticipant = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const deleted = await CourseParticipant.destroy({
      where: {
        course_id: id,
        participant_id: participantId,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Relación no encontrada." });
    }

    const course = await Course.findByPk(id, { include: [{ model: Detail }] });
    if (course?.Detail) {
      const curEnrolled = course.Detail.num_enrolled || 0;
      const curRegistered = course.Detail.num_registered || 0;
      await course.Detail.update({
        num_enrolled: Math.max(0, curEnrolled - 1),
        num_registered: Math.max(0, curRegistered - 1),
        updated_at: new Date(),
      });
    }

    return res.status(200).json({ message: "Participante retirado de esta edición." });
  } catch (error) {
    console.error("Error al retirar participante:", error);
    return res.status(500).json({ message: "Error al retirar participante.", error: error.message });
  }
};

export const updateParticipantAcademicRecord = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const { grade_final, status_code, total_payment, enrolled, approval } = req.body;

    const coursePart = await CourseParticipant.findOne({
      where: {
        course_id: id,
        participant_id: participantId,
      },
    });

    if (!coursePart) {
      return res.status(404).json({ message: "Registro del estudiante en este curso no encontrado." });
    }

    if (grade_final !== undefined && grade_final !== null && grade_final !== "") {
      const numGrade = parseFloat(grade_final);
      coursePart.grade_final = numGrade;
      if (approval !== undefined) {
        coursePart.approval = Boolean(approval);
      } else {
        coursePart.approval = numGrade >= 70.0;
      }
      coursePart.status_code = coursePart.approval ? "P" : "F";
    }

    if (status_code !== undefined) {
      coursePart.status_code = status_code;
      if (status_code === "P") coursePart.approval = true;
      if (status_code === "F" || status_code === "I") coursePart.approval = false;
    }

    if (total_payment !== undefined) {
      coursePart.total_payment = parseFloat(total_payment) || 0.0;
    }

    if (enrolled !== undefined) {
      coursePart.enrolled = Boolean(enrolled);
    }

    coursePart.updated_at = new Date();
    await coursePart.save();

    const course = await Course.findByPk(id, { include: [{ model: Detail }] });
    if (course?.Detail) {
      const allParts = await CourseParticipant.findAll({ where: { course_id: id } });
      const enrolledCount = allParts.filter((cp) => cp.enrolled).length;
      const failedCount = allParts.filter((cp) => cp.status_code === "F").length;
      await course.Detail.update({
        num_enrolled: enrolledCount,
        num_failed: failedCount,
        updated_at: new Date(),
      });
    }

    return res.status(200).json({
      message: "Historial académico del estudiante actualizado.",
      courseParticipant: coursePart,
    });
  } catch (error) {
    console.error("Error al actualizar récord académico:", error);
    return res.status(500).json({
      message: "Error al actualizar récord académico del estudiante.",
      error: error.message,
    });
  }
};

export const validateCourseClosure = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [{ model: Instructor }, { model: Modality, through: { attributes: [] } }],
        },
        {
          model: Participant,
          include: [{ model: ParticipantType }],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const participants = course.Participants || [];
    const detail = course.Detail || {};
    const instructor = detail.Instructor || null;
    const modalities = detail.Modalities || [];

    // 1. Fechas
    const hasDates = Boolean(course.start_date && course.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = course.end_date ? new Date(course.end_date) : null;
    const datesPassed = hasDates && endDate && today >= endDate;

    // 2. Evaluaciones
    const pendingStudents = [];
    let evaluatedCount = 0;

    for (const p of participants) {
      const cp = p.CourseParticipant || {};
      const hasGrade = cp.grade_final !== null && cp.grade_final !== undefined;
      const isResolved = cp.status_code === "P" || cp.status_code === "F";
      if (hasGrade || isResolved) {
        evaluatedCount++;
      } else {
        pendingStudents.push({
          participant_id: p.participant_id,
          name: p.name,
          cid: p.cid,
          status_code: cp.status_code || "I",
        });
      }
    }

    const evaluationsPassed = participants.length > 0 ? pendingStudents.length === 0 : true;

    // 3. Instructor y modalidad
    const instructorPassed = Boolean(instructor && instructor.instructor_id);
    const modalityPassed = Boolean(modalities && modalities.length > 0);

    // 4. Horas
    const totalHours = Number(detail.total_hours) || 0;
    const hoursPassed = totalHours > 0;

    const canClose = evaluationsPassed && instructorPassed && modalityPassed;

    return res.status(200).json({
      course_id: course.course_id,
      course_name: course.course_name,
      current_status: course.status,
      can_close: canClose,
      checks: {
        dates: {
          passed: Boolean(datesPassed),
          start_date: course.start_date,
          end_date: course.end_date,
          message: datesPassed
            ? "El periodo de fechas planificado ha culminado."
            : "La fecha de fin programada aún no se cumple o está en curso.",
        },
        evaluations: {
          passed: Boolean(evaluationsPassed),
          total: participants.length,
          evaluated: evaluatedCount,
          pending: pendingStudents.length,
          pending_students: pendingStudents,
          message: evaluationsPassed
            ? "100% de estudiantes con evaluación final registrada (P/F)."
            : `Existen ${pendingStudents.length} estudiante(s) sin calificación definitiva o en estado Incompleto.`,
        },
        instructor: {
          passed: Boolean(instructorPassed),
          instructor_name: instructor ? instructor.name : null,
          message: instructorPassed
            ? `Docente titular asignado: ${instructor.name}`
            : "No hay docente titular asignado a la edición.",
        },
        modality: {
          passed: Boolean(modalityPassed),
          modalities: modalities.map((m) => m.name),
          message: modalityPassed
            ? `Modalidad activa: ${modalities.map((m) => m.name).join(", ")}`
            : "No se ha definido la modalidad del curso.",
        },
        hours: {
          passed: Boolean(hoursPassed),
          total_hours: totalHours,
          message: hoursPassed
            ? `${totalHours} horas académicas oficiales registradas.`
            : "No se han definido las horas del curso.",
        },
      },
    });
  } catch (error) {
    console.error("Error al validar cierre de edición:", error);
    return res.status(500).json({
      message: "Error al validar cierre de edición.",
      error: error.message,
    });
  }
};

export const closeCourseEdition = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.body;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [{ model: Instructor }, { model: Modality, through: { attributes: [] } }],
        },
        {
          model: Participant,
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    if (course.status === "Finalizado") {
      return res.status(400).json({ message: "La edición ya se encuentra finalizada y sellada." });
    }

    const participants = course.Participants || [];
    const pending = participants.filter((p) => {
      const cp = p.CourseParticipant || {};
      return cp.grade_final === null && cp.status_code !== "P" && cp.status_code !== "F";
    });

    if (pending.length > 0 && !force) {
      return res.status(400).json({
        message: `No se puede cerrar la edición: existen ${pending.length} estudiante(s) sin calificación definitiva (P/F).`,
        pending_count: pending.length,
      });
    }

    course.status = "Finalizado";
    course.updated_at = new Date();
    await course.save();

    return res.status(200).json({
      message: "Edición del curso formalmente finalizada y auditada. El expediente ha pasado a modo solo lectura.",
      course,
      closed_at: new Date(),
    });
  } catch (error) {
    console.error("Error al cerrar edición del curso:", error);
    return res.status(500).json({
      message: "Error al cerrar edición del curso.",
      error: error.message,
    });
  }
};

export const reopenCourseEdition = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    course.status = "En ejecución";
    course.updated_at = new Date();
    await course.save();

    return res.status(200).json({
      message: "Edición reabierta para modificaciones académicas.",
      course,
    });
  } catch (error) {
    console.error("Error al reabrir edición:", error);
    return res.status(500).json({
      message: "Error al reabrir edición.",
      error: error.message,
    });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      instructor_name,
      instructor_role,
      coordinator_name,
      coordinator_role,
      dean_name,
      dean_role,
    } = req.query;

    const course = await Course.findOne({
      where: { course_id: id },
      include: [
        {
          model: Participant,
          include: [
            { model: ParticipantType },
            { model: InfoUtn, through: { attributes: [] } },
            {
              model: Payment,
              through: { attributes: [] },
              include: [
                {
                  model: PaymentType,
                },
              ],
            },
          ],
        },
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
        },
        {
          model: Detail,
          include: [
            { model: DetailValues },
            {
              model: Instructor,
            },
            {
              model: Modality,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (course.status != "Finalizado") {
      return res.status(400).json({ message: "El estado del curso debe ser FINALIZADO para poder generar los certificados," });
    }

    if (!course) {
      return res.status(404).json({ message: notifications.cursos.c5 });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificado-curso-${id}.pdf"`
    );

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const logoPath = path.resolve(__dirname, "../../assets/cisco_logo.png");
    const logoUtnPath = path.resolve(__dirname, "../../assets/logo_utn.png");

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });

    doc.pipe(res);

    const primaryColor = "#b3d9ff";
    const utnColor = "#f4040c";
    const textColor = "#333333";
    const borderWidth = 2;

    course.Participants.forEach((participant) => {
      doc.addPage();

      doc
        .rect(
          borderWidth,
          borderWidth,
          doc.page.width - borderWidth * 2,
          doc.page.height - borderWidth * 2
        )
        .lineWidth(borderWidth)
        .stroke(utnColor);

      // Fondo claro
      // doc
      //   .rect(
      //     borderWidth + 5,
      //     borderWidth + 5,
      //     doc.page.width - (borderWidth + 5) * 2,
      //     doc.page.height - (borderWidth + 5) * 2
      //   )
      // .fillOpacity(0.5)
      // .fill(primaryColor);

      doc.image(logoUtnPath, 40, 25, { width: 100 });
      doc.image(logoPath, doc.page.width - 150, 40, { width: 100 });

      doc
        .fillColor(textColor)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("UNIVERSIDAD TÉCNICA DEL NORTE", { align: "center" })
        .moveDown(0.5)
        .fontSize(18)
        .text("FACULTAD DE INGENIERÍA EN CIENCIAS APLICADAS", {
          align: "center",
        })
        .moveDown(0.5)
        .text("ACADEMIA CISCO", { align: "center" });

      doc.moveDown(2);

      doc
        .fontSize(20)
        .text("CERTIFICADO", { align: "center" })
        .moveDown(1.5)
        .font("Helvetica")
        .fontSize(16)
        .text("Se otorga el presente certificado a:", { align: "center" })
        .moveDown(1.5);

      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .text(participant.name.toUpperCase(), { align: "center" })
        .moveDown(1);

      const modality =
        course.Detail.Modalities && course.Detail.Modalities.length > 0
          ? course.Detail.Modalities[0].name
          : "Modalidad no especificada";

      const startDate = new Date(course.start_date).toLocaleDateString(
        "es-ES",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      const endDate = new Date(course.end_date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const totalHours = course.Detail ? course.Detail.total_hours : "N/A";

      doc
        .font("Helvetica")
        .fontSize(14)
        .text(
          `Por haber asistido y aprobado el curso "${course.course_name}", desarrollado en modalidad ${modality} del ${startDate} al ${endDate}, con una duración total de ${totalHours} horas.`,
          { align: "center", lineGap: 6 }
        );
      // .moveDown(1);

      const today = new Date().toLocaleDateString("es-ES");

      doc.moveDown(1);

      doc
        .fontSize(11)
        .text(`Fecha Emisión: ${today}`, {
          align: "right",
        });

      const signatureY = doc.page.height - 120;
      const colWidth = 220;
      const col1X = 50;
      const col2X = 311;
      const col3X = 572;

      const finalInstructorName =
        (instructor_name && instructor_name.trim()) ||
        course.Detail?.Instructor?.name ||
        "Docente Instructor";
      const finalInstructorRole =
        (instructor_role && instructor_role.trim()) || "Docente Instructor";

      const finalCoordName =
        (coordinator_name && coordinator_name.trim()) || "MSc. Ludmila Starodub";
      const finalCoordRole =
        (coordinator_role && coordinator_role.trim()) ||
        "Analista de sistemas – Coordinadora Academia CISCO";

      const finalDeanName =
        (dean_name && dean_name.trim()) || "Magíster Catalina Ramírez";
      const finalDeanRole =
        (dean_role && dean_role.trim()) || "Decana FICA - UTN";

      // 1. Instructor
      doc
        .font("Helvetica")
        .fontSize(10)
        .text("____________________________", col1X, signatureY, {
          width: colWidth,
          align: "center",
        });
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(finalInstructorName, col1X, signatureY + 16, {
          width: colWidth,
          align: "center",
        });
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(finalInstructorRole, col1X, signatureY + 30, {
          width: colWidth,
          align: "center",
        });

      // 2. Coordinadora
      doc
        .font("Helvetica")
        .fontSize(10)
        .text("____________________________", col2X, signatureY, {
          width: colWidth,
          align: "center",
        });
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(finalCoordName, col2X, signatureY + 16, {
          width: colWidth,
          align: "center",
        });
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(finalCoordRole, col2X, signatureY + 30, {
          width: colWidth,
          align: "center",
        });

      // 3. Decana
      doc
        .font("Helvetica")
        .fontSize(10)
        .text("____________________________", col3X, signatureY, {
          width: colWidth,
          align: "center",
        });
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(finalDeanName, col3X, signatureY + 16, {
          width: colWidth,
          align: "center",
        });
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(finalDeanRole, col3X, signatureY + 30, {
          width: colWidth,
          align: "center",
        });
    });

    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: notifications.principal.p1 });
  }
};

export const addCourseChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, hours = null, main_topics = null, modality = null, activity = null, start_date = null, end_date = null, session_start_time = null, session_end_time = null } = req.body;

    if (!chapter_name) {
      return res.status(400).json({ message: "El nombre del capítulo es obligatorio." });
    }

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const lastRelation = await CourseChapter.findOne({ where: { course_id: id }, order: [["sort_order", "DESC"], ["course_chapter_id", "DESC"]] });
    const chapter = await Chapter.create({
      chapter_name,
      hours: hours === null || hours === "" ? null : Number(hours),
      main_topics: main_topics ? main_topics.trim() : null,
      modality: modality || null,
      activity: activity ? activity.trim() : null,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      session_start_time: session_start_time || null,
      session_end_time: session_end_time || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await CourseChapter.create({
      course_id: id,
      chapter_id: chapter.chapter_id,
      sort_order: (Number(lastRelation?.sort_order) || 0) + 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Capítulo agregado exitosamente al temario de esta edición.",
      chapter,
    });
  } catch (error) {
    console.error("Error al agregar capítulo:", error);
    return res.status(500).json({ message: "Error al agregar capítulo.", error: error.message });
  }
};

export const reorderCourseChapters = async (req, res) => {
  const transaction = await Course.sequelize.transaction();
  try {
    const { id } = req.params;
    const chapterIds = req.body.chapter_ids;
    if (!Array.isArray(chapterIds)) return res.status(400).json({ message: "La secuencia de contenidos no es válida." });
    const relations = await CourseChapter.findAll({ where: { course_id: id }, order: [["sort_order", "ASC"], ["course_chapter_id", "ASC"]], transaction });
    const current = relations.map((relation) => Number(relation.chapter_id)).sort((a, b) => a - b);
    const requested = chapterIds.map(Number).sort((a, b) => a - b);
    if (current.length !== requested.length || current.some((value, index) => value !== requested[index])) {
      await transaction.rollback();
      return res.status(400).json({ message: "La secuencia debe incluir cada contenido de la edición una sola vez." });
    }
    const relationByChapter = new Map(relations.map((relation) => [Number(relation.chapter_id), relation]));
    await Promise.all(chapterIds.map((chapterId, index) => relationByChapter.get(Number(chapterId)).update({ sort_order: index + 1 }, { transaction })));
    await transaction.commit();
    return res.status(200).json({ message: "Orden del cronograma actualizado." });
  } catch (error) {
    await transaction.rollback();
    console.error("Error ordenando cronograma:", error);
    return res.status(500).json({ message: "No se pudo guardar el orden del cronograma." });
  }
};

export const updateCourseChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { chapter_name, hours, main_topics, modality, activity, start_date, end_date, session_start_time, session_end_time } = req.body;

    let chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Capítulo no encontrado." });
    }

    const relation = await CourseChapter.findOne({ where: { course_id: id, chapter_id: chapterId } });
    if (!relation) return res.status(404).json({ message: "El contenido no pertenece a esta edición." });
    const uses = await CourseChapter.count({ where: { chapter_id: chapterId } });
    if (uses > 1) {
      chapter = await Chapter.create({ chapter_name: chapter.chapter_name, hours: chapter.hours, main_topics: chapter.main_topics, modality: chapter.modality, activity: chapter.activity, start_date: chapter.start_date, end_date: chapter.end_date, session_start_time: chapter.session_start_time, session_end_time: chapter.session_end_time });
      await relation.update({ chapter_id: chapter.chapter_id });
    }

    if (chapter_name) chapter.chapter_name = chapter_name;
    if (hours !== undefined) chapter.hours = Number(hours);
    if (main_topics !== undefined) chapter.main_topics = main_topics ? main_topics.trim() : null;
    if (modality !== undefined) chapter.modality = modality;
    if (activity !== undefined) chapter.activity = activity ? activity.trim() : null;
    if (start_date !== undefined) chapter.start_date = start_date ? new Date(start_date) : null;
    if (end_date !== undefined) chapter.end_date = end_date ? new Date(end_date) : null;
    if (session_start_time !== undefined) chapter.session_start_time = session_start_time || null;
    if (session_end_time !== undefined) chapter.session_end_time = session_end_time || null;
    chapter.updated_at = new Date();
    await chapter.save();

    return res.status(200).json({
      message: "Capítulo actualizado exitosamente.",
      chapter,
    });
  } catch (error) {
    console.error("Error al actualizar capítulo:", error);
    return res.status(500).json({ message: "Error al actualizar capítulo.", error: error.message });
  }
};

export const removeCourseChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;

    const relation = await CourseChapter.findOne({
      where: {
        course_id: id,
        chapter_id: chapterId,
      },
    });

    if (!relation) {
      return res.status(404).json({ message: "El capítulo no pertenece a este curso." });
    }

    await relation.destroy();

    return res.status(200).json({
      message: "Capítulo desvinculado exitosamente de esta edición.",
    });
  } catch (error) {
    console.error("Error al retirar capítulo:", error);
    return res.status(500).json({ message: "Error al retirar capítulo.", error: error.message });
  }
};

export const loadDefaultCourseChapters = async (req, res) => {
  try {
    const { id } = req.params;

    const targetCourse = await Course.findByPk(id, {
      include: [
        { model: Chapter },
        { model: Course, as: "TemplateCourse", include: [{ model: Chapter }] },
      ],
    });

    if (!targetCourse) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    if (targetCourse.Chapters && targetCourse.Chapters.length > 0) {
      return res.status(400).json({
        message: "Esta edición ya cuenta con capítulos asignados.",
      });
    }

    // Buscar la plantilla base de este curso en particular
    const templateCourse = targetCourse.TemplateCourse;
    const chaptersToCopy = templateCourse?.Chapters || [];

    if (chaptersToCopy.length === 0) {
      const templateName = templateCourse ? templateCourse.course_name : "origen";
      return res.status(400).json({
        message: `El curso catálogo base "${templateName}" aún no tiene capítulos precargados en el sistema. Puede añadir los temas directamente con el botón "+ Agregar Capítulo / Lab".`,
      });
    }

    const orderedChapters = [...chaptersToCopy].sort((a, b) =>
      (Number(a.CourseChapter?.sort_order) || Number(a.CourseChapter?.course_chapter_id) || 0)
      - (Number(b.CourseChapter?.sort_order) || Number(b.CourseChapter?.course_chapter_id) || 0)
    );
    for (const ch of orderedChapters) {
      const lastRelation = await CourseChapter.findOne({ where: { course_id: id }, order: [["sort_order", "DESC"], ["course_chapter_id", "DESC"]] });
      const editionChapter = await Chapter.create({
        chapter_name: ch.chapter_name,
        hours: ch.hours,
        main_topics: ch.main_topics,
        modality: ch.modality,
        activity: ch.activity,
        start_date: null,
        end_date: null,
        session_start_time: null,
        session_end_time: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      await CourseChapter.create({
        course_id: id,
        chapter_id: editionChapter.chapter_id,
        sort_order: (Number(lastRelation?.sort_order) || 0) + 1,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return res.status(200).json({
      message: `Se cargaron ${chaptersToCopy.length} capítulos oficiales de la plantilla "${templateCourse.course_name}".`,
      count: chaptersToCopy.length,
    });
  } catch (error) {
    console.error("Error al cargar capítulos base:", error);
    return res.status(500).json({ message: "Error al cargar capítulos base.", error: error.message });
  }
};

export const getCoursePayments = async (req, res) => {
  try {
    const { id } = req.params;

    const payments = await Payment.findAll({
      where: { course_id: id },
      include: [
        { model: PaymentType },
        {
          model: CourseParticipant,
          include: [{ model: Participant, attributes: ['participant_id', 'name', 'cid', 'email'] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ payments });
  } catch (error) {
    console.error("Error al obtener pagos del curso:", error);
    return res.status(500).json({ message: "Error al obtener pagos.", error: error.message });
  }
};

export const validateParticipantPayment = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const {
      invoice_number,
      invoice_date,
      payer_cid_ruc,
      payer_name,
      subtotal,
      iva,
      amount,
      project_code = "0607",
      payment_type_id = 1,
      enrolled = true,
    } = req.body;

    const course = await Course.findByPk(id, { include: [{ model: Detail }] });
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const cp = await CourseParticipant.findOne({
      where: { course_id: id, participant_id: participantId },
    });
    if (!cp) {
      return res.status(404).json({ message: "El participante no está inscrito en este curso." });
    }

    const wasEnrolledBefore = Boolean(cp.enrolled);

    if (!invoice_number || !String(invoice_number).trim()) {
      return res.status(400).json({ message: "Debe ingresar el número de factura para registrar la matrícula." });
    }

    const cleanInvoice = String(invoice_number).trim();
    const cleanDate = invoice_date || new Date().toISOString().split("T")[0];

    // 1. Buscar si ya existe la factura en la base de datos de pagos
    let payment = await Payment.findOne({
      where: { invoice_number: cleanInvoice },
    });

    if (payment) {
      // Si la factura ya existía en pagos, actualizamos datos si se proporcionaron y vinculamos al curso
      const updates = {};
      if (!payment.course_id) updates.course_id = id;
      if (payer_name && payer_name.trim()) updates.payer_name = payer_name.trim();
      if (payer_cid_ruc && payer_cid_ruc.trim()) updates.payer_cid_ruc = payer_cid_ruc.trim();
      if (invoice_date) updates.invoice_date = invoice_date;
      if (amount !== undefined && amount !== null && !isNaN(amount)) {
        updates.amount = parseFloat(amount);
        updates.subtotal = parseFloat((parseFloat(amount) / 1.15).toFixed(2));
        updates.iva = parseFloat((parseFloat(amount) - updates.subtotal).toFixed(2));
      }
      if (Object.keys(updates).length > 0) {
        await payment.update(updates);
      }
    } else {
      // Si no existe previamente en pagos, creamos el registro de pago con los datos mínimos esenciales
      const participant = await Participant.findByPk(participantId);
      const finalAmount = amount !== undefined && amount !== null && !isNaN(amount) ? parseFloat(amount) : 69.0;
      const finalSubtotal = subtotal !== undefined && subtotal !== null && !isNaN(subtotal)
        ? parseFloat(subtotal)
        : parseFloat((finalAmount / 1.15).toFixed(2));
      const finalIva = iva !== undefined && iva !== null && !isNaN(iva)
        ? parseFloat(iva)
        : parseFloat((finalAmount - finalSubtotal).toFixed(2));

      payment = await Payment.create({
        invoice_number: cleanInvoice,
        invoice_date: cleanDate,
        payer_cid_ruc: payer_cid_ruc || participant?.cid || "",
        payer_name: payer_name || participant?.name || "",
        subtotal: finalSubtotal,
        iva: finalIva,
        amount: finalAmount,
        project_code: project_code || "0607",
        course_id: id,
        payment_type_id: payment_type_id || 1,
        description: `Pago matrícula - Factura ${cleanInvoice}`,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Vincular la relación en ParticipantPayment
    await ParticipantPayment.findOrCreate({
      where: { participant_id: participantId, payment_id: payment.payment_id },
      defaults: { participant_id: participantId, payment_id: payment.payment_id },
    });

    // 2. Actualizar CourseParticipant formalizando la matrícula
    const newEnrolledState = enrolled !== undefined ? Boolean(enrolled) : true;
    await cp.update({
      payment_id: newEnrolledState ? payment.payment_id : null,
      invoice_number: newEnrolledState ? payment.invoice_number : null,
      total_payment: newEnrolledState ? payment.amount : 0.0,
      validation_date: newEnrolledState ? (payment.invoice_date || cleanDate) : null,
      enrolled: newEnrolledState,
      updated_at: new Date(),
    });

    // 3. Actualizar num_enrolled en Detail si cambió de Inscrito a Matriculado
    if (course.Detail) {
      if (!wasEnrolledBefore && newEnrolledState) {
        await course.Detail.update({
          num_enrolled: (course.Detail.num_enrolled || 0) + 1,
          updated_at: new Date(),
        });
      } else if (wasEnrolledBefore && !newEnrolledState) {
        await course.Detail.update({
          num_enrolled: Math.max(0, (course.Detail.num_enrolled || 1) - 1),
          updated_at: new Date(),
        });
      }
    }

    return res.status(200).json({
      message: newEnrolledState
        ? `Estudiante matriculado exitosamente con la factura N° ${payment.invoice_number}.`
        : "Registro de pago actualizado.",
      payment,
      courseParticipant: cp,
    });
  } catch (error) {
    console.error("Error al validar pago y matrícula:", error);
    return res.status(500).json({ message: "Error al validar pago.", error: error.message });
  }
};

export const importInvoicesBulk = async (req, res) => {
  try {
    const { id } = req.params;
    const { invoices = [] } = req.body;

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({ message: "No se proporcionaron registros de facturas." });
    }

    const course = await Course.findByPk(id, {
      include: [{ model: Detail }, { model: Participant }],
    });
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    let newlyMatchedCount = 0;
    let createdPaymentsCount = 0;
    const unmatchedInvoices = [];

    const existingParticipants = course.Participants || [];

    for (const inv of invoices) {
      const invoiceNumber = String(inv.factura || inv.invoice_number || "").trim();
      if (!invoiceNumber) continue;

      const rawDate = inv.fecha || inv.date;
      let invoiceDate = null;
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) invoiceDate = d.toISOString().split("T")[0];
      }
      if (!invoiceDate) invoiceDate = new Date().toISOString().split("T")[0];

      const ruc = String(inv.ruc || inv.cedula || inv.ci || "").trim();
      const payerName = String(inv.apellidos_empresa || inv.apellidos || inv.payer_name || "").trim() +
        (inv.nombre ? " " + String(inv.nombre).trim() : "");
      const subtotal = parseFloat(inv.v_total || inv.subtotal || 60.0);
      const iva = parseFloat(inv.iva || 9.0);
      const totalAmount = parseFloat(inv.total || inv.amount || (subtotal + iva));
      const projectCode = String(inv.proyecto || "0607").trim();

      // Guardar o actualizar registro de Pago
      let [payment, created] = await Payment.findOrCreate({
        where: { invoice_number: invoiceNumber, course_id: id },
        defaults: {
          invoice_date: invoiceDate,
          payer_cid_ruc: ruc,
          payer_name: payerName,
          subtotal,
          iva,
          amount: totalAmount,
          project_code: projectCode,
          course_id: id,
          payment_type_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (!created) {
        await payment.update({
          invoice_date: invoiceDate,
          payer_cid_ruc: ruc || payment.payer_cid_ruc,
          payer_name: payerName || payment.payer_name,
          subtotal,
          iva,
          amount: totalAmount,
          project_code: projectCode,
          updated_at: new Date(),
        });
      } else {
        createdPaymentsCount++;
      }

      // Intentar vincular automáticamente con estudiante inscrito
      // 1. Coincidencia por RUC/Cédula
      let matchedParticipant = existingParticipants.find(
        (p) => String(p.cid).trim() === ruc
      );

      // 2. Coincidencia por Apellidos/Nombres si no coincidió cédula (ej. pagó con RUC de empresa o padre pero el nombre contiene el apellido)
      if (!matchedParticipant && payerName.length > 5) {
        const words = payerName.toLowerCase().split(" ").filter((w) => w.length > 3);
        matchedParticipant = existingParticipants.find((p) => {
          const pName = (p.name || "").toLowerCase();
          return words.filter((w) => pName.includes(w)).length >= 2;
        });
      }

      if (matchedParticipant) {
        const cp = await CourseParticipant.findOne({
          where: { course_id: id, participant_id: matchedParticipant.participant_id },
        });

        if (cp) {
          const wasEnrolled = Boolean(cp.enrolled);
          await cp.update({
            payment_id: payment.payment_id,
            invoice_number: invoiceNumber,
            total_payment: totalAmount,
            validation_date: invoiceDate,
            enrolled: true,
            updated_at: new Date(),
          });

          if (!wasEnrolled && course.Detail) {
            await course.Detail.update({
              num_enrolled: (course.Detail.num_enrolled || 0) + 1,
              updated_at: new Date(),
            });
          }
          newlyMatchedCount++;
        }
      } else {
        unmatchedInvoices.push({
          invoice_number: invoiceNumber,
          payer_name: payerName,
          payer_cid_ruc: ruc,
          amount: totalAmount,
        });
      }
    }

    return res.status(200).json({
      message: `Procesadas ${invoices.length} facturas: ${newlyMatchedCount} estudiantes matriculados automáticamente.`,
      createdPaymentsCount,
      newlyMatchedCount,
      unmatchedCount: unmatchedInvoices.length,
      unmatchedInvoices,
    });
  } catch (error) {
    console.error("Error al importar reporte de facturación:", error);
    return res.status(500).json({ message: "Error al importar facturas.", error: error.message });
  }
};

export const downloadCourseDocumentDocx = async (req, res) => {
  try {
    const { id, docType } = req.params;

    const course = await Course.findOne({
      where: { course_id: id },
      include: [
        {
          model: Course,
          as: "TemplateCourse",
          required: false,
          include: [{ model: Detail }],
        },
        {
          model: Detail,
          include: [
            { model: DetailValues },
            { model: Instructor },
            { model: Modality, through: { attributes: [] } },
            { model: Schedule, through: { attributes: [] } },
            { model: Cost, through: { attributes: [] } },
          ],
        },
        {
          model: Participant,
          include: [{ model: ParticipantType }],
        },
        {
          model: Chapter,
          through: { attributes: [] },
        },
        {
          model: Payment,
        },
      ],
      order: [[Chapter, "chapter_id", "ASC"]],
    });

    if (!course) {
      return res.status(404).json({ message: "Edición de curso no encontrada." });
    }

    let buffer;
    let filename;
    const cleanCourseName = (course.course_name || "Curso").replace(/[^a-zA-Z0-9_-]/g, "_");
    const normalizedDocType = (docType || "").toLowerCase();

    if (
      normalizedDocType === "planificacion" ||
      normalizedDocType === "planificacion-de-curso" ||
      normalizedDocType === "planificacion_curso" ||
      normalizedDocType === "memo_planificacion"
    ) {
      buffer = await generatePlanificacionDocx(course);
      filename = `Planificacion_${cleanCourseName}.docx`;
    } else if (
      normalizedDocType === "cronograma" ||
      normalizedDocType === "cronograma-de-actividades" ||
      normalizedDocType === "cronograma_actividades"
    ) {
      buffer = await generateCronogramaDocx(course);
      filename = `Cronograma_${cleanCourseName}.docx`;
    } else if (
      normalizedDocType === "informe" ||
      normalizedDocType === "informe-final" ||
      normalizedDocType === "informe-final-del-curso" ||
      normalizedDocType === "informe_final" ||
      normalizedDocType === "memo_cierre"
    ) {
      buffer = await generateInformeFinalDocx(course);
      filename = `InformeFinal_${cleanCourseName}.docx`;
    } else if (
      normalizedDocType === "reporte_aprobados" ||
      normalizedDocType === "nomina_aprobados" ||
      normalizedDocType === "aprobados"
    ) {
      buffer = await generateReporteAprobadosDocx(course);
      filename = `Nomina_Aprobados_${cleanCourseName}.docx`;
    } else {
      return res.status(400).json({
        message: `El tipo de documento '${docType}' no cuenta con plantilla de generación DOCX.`,
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    return res.send(buffer);
  } catch (error) {
    console.error("Error al exportar documento DOCX:", error);
    return res
      .status(500)
      .json({ message: "Error al generar el documento DOCX.", error: error.message });
  }
};
