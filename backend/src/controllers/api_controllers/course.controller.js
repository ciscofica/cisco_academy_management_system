import Course from "../../models/Course.js";
import Cost from "../../models/Cost.js";
import Chapter from "../../models/Chapter.js";

import Participant from "../../models/Participant.js";
import ParticipantType from "../../models/ParticipantType.js";
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
      order: [["course_name", "ASC"]],
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
      course_description: tplDet?.course_description || `Curso oficial CISCO: ${templateCourse.course_name}`,
      total_hours: tplDet?.total_hours || 70,
      instructor_hours: tplDet?.instructor_hours || 50,
      activities_hours: tplDet?.activities_hours || 20,
      cost_per_hour: tplDet?.cost_per_hour || 13.0,
      participant_requeriment: tplDet?.participant_requeriment || "",
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

    // 4. Copiar/Asociar todos los capítulos de la plantilla a la nueva edición
    if (templateCourse.Chapters && templateCourse.Chapters.length > 0) {
      await CourseChapter.bulkCreate(
        templateCourse.Chapters.map((ch) => ({
          course_id: newCourse.course_id,
          chapter_id: ch.chapter_id,
          created_at: new Date(),
          updated_at: new Date(),
        }))
      );
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
        total_hours: total_hours || 70,
        instructor_hours: instructor_hours || 50,
        activities_hours: activities_hours || 20,
        cost_per_hour: cost_per_hour || 13.0,
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
      phone,
      address,
      institution,
      participant_type_id,
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
    } else if (cid) {
      participant = await Participant.findOne({ where: { cid } });
      if (!participant) {
        participant = await Participant.create({
          name: name || "Nuevo Participante",
          cid,
          phone: phone || "",
          address: address || "",
          institution: institution || "",
          participant_type_id: participant_type_id || 1,
          enrolled: Boolean(enrolled),
          registered: Boolean(registered),
          approval: false,
          total_payment: total_payment || 0.0,
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
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
        message: "El estudiante ya se encuentra matriculado en esta edición del curso.",
      });
    }

    await CourseParticipant.create({
      course_id: id,
      participant_id: participant.participant_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (course.Detail) {
      const curEnrolled = course.Detail.num_enrolled || 0;
      const curRegistered = course.Detail.num_registered || 0;
      await course.Detail.update({
        num_enrolled: curEnrolled + 1,
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

export const getCertificates = async (req, res) => {
  try {
    const { id } = req.params;

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
          model: Detail,
          include: [
            { model: DetailValues },
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
      const signatureMargin = 50;

      doc.moveDown(2);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text("______________________", signatureMargin + 200, signatureY, {
          align: "left",
        })
        .text(
          "Coordinador/a Academia Cisco",
          signatureMargin + 190,
          signatureY + 20,
          { align: "left" }
        )
        .moveDown(2);

      doc
        .text(
          "______________________",
          doc.page.width - signatureMargin - 350,
          signatureY,
          { align: "left" }
        )
        .text(
          "Decano/a FICA",
          doc.page.width - signatureMargin - 320,
          signatureY + 20,
          { align: "left" }
        );
    });

    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: notifications.principal.p1 });
  }
};
