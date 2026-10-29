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
      email,
      phone,
      address,
      institution,
      participant_type_id,
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
      if (degree_level && !participant.degree_level) { participant.degree_level = parseInt(degree_level); needsSave = true; }
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
          degree_level: degree_level ? parseInt(degree_level) : null,
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
      total_payment: total_payment ? parseFloat(total_payment) : 0.0,
      enrolled: enrolled !== undefined ? Boolean(enrolled) : true,
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

export const addCourseChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, hours = 2 } = req.body;

    if (!chapter_name) {
      return res.status(400).json({ message: "El nombre del capítulo es obligatorio." });
    }

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const chapter = await Chapter.create({
      chapter_name,
      hours: Number(hours) || 2,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await CourseChapter.create({
      course_id: id,
      chapter_id: chapter.chapter_id,
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

export const updateCourseChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { chapter_name, hours } = req.body;

    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Capítulo no encontrado." });
    }

    if (chapter_name) chapter.chapter_name = chapter_name;
    if (hours !== undefined) chapter.hours = Number(hours);
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

    for (const ch of chaptersToCopy) {
      await CourseChapter.create({
        course_id: id,
        chapter_id: ch.chapter_id,
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
