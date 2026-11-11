import Payment from "../../models/Payment.js";
import Participant from "../../models/Participant.js";
import ParticipantPayment from "../../models/ParticipantPayment.js";
import Course from "../../models/Course.js";
import CourseParticipant from "../../models/CourseParticipant.js";
import Detail from "../../models/Detail.js";
// import notifications from "../../notifications.json" assert { type: "json" };
import fs from "fs";
import path from "path";

const jsonPath = path.resolve("./src/notifications.json");
const notifications = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
import { Op } from "sequelize";
import PaymentType from "../../models/PaymentType.js";

export const addPayment = async (req, res) => {
  try {
    const {
      invoice_number,
      invoice_date,
      payer_cid_ruc,
      payer_name,
      subtotal,
      iva,
      description,
      amount,
      project_code = "0607",
      course_id,
      payment_type_id = 1,
      participant_id,
    } = req.body;

    const finalAmount = parseFloat(amount) || 0.0;
    const finalSubtotal = subtotal !== undefined && subtotal !== null && !isNaN(subtotal)
      ? parseFloat(subtotal)
      : parseFloat((finalAmount / 1.15).toFixed(2));
    const finalIva = iva !== undefined && iva !== null && !isNaN(iva)
      ? parseFloat(iva)
      : parseFloat((finalAmount - finalSubtotal).toFixed(2));

    const newPayment = await Payment.create({
      invoice_number: invoice_number ? String(invoice_number).trim() : null,
      invoice_date: invoice_date || new Date().toISOString().split("T")[0],
      payer_cid_ruc: payer_cid_ruc ? String(payer_cid_ruc).trim() : null,
      payer_name: payer_name ? String(payer_name).trim() : null,
      subtotal: finalSubtotal,
      iva: finalIva,
      amount: finalAmount,
      description: description || null,
      project_code: project_code || "0607",
      course_id: course_id || null,
      payment_type_id: payment_type_id || 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Si viene participant_id o se deduce de la cédula en este curso
    let resolvedPartId = participant_id;
    if (!resolvedPartId && payer_cid_ruc) {
      const p = await Participant.findOne({ where: { cid: String(payer_cid_ruc).trim() } });
      if (p) resolvedPartId = p.participant_id;
    }

    if (resolvedPartId) {
      await ParticipantPayment.findOrCreate({
        where: { participant_id: resolvedPartId, payment_id: newPayment.payment_id },
        defaults: { participant_id: resolvedPartId, payment_id: newPayment.payment_id },
      });

      // Si el pago pertenece a un curso específico, formalizar la matrícula del estudiante en ese curso
      if (course_id) {
        const cp = await CourseParticipant.findOne({
          where: { course_id, participant_id: resolvedPartId },
        });

        if (cp) {
          const wasEnrolled = Boolean(cp.enrolled);
          await cp.update({
            payment_id: newPayment.payment_id,
            invoice_number: newPayment.invoice_number,
            total_payment: newPayment.amount,
            validation_date: newPayment.invoice_date,
            enrolled: true,
            updated_at: new Date(),
          });

          if (!wasEnrolled) {
            const course = await Course.findByPk(course_id, { include: [{ model: Detail }] });
            if (course && course.Detail) {
              await course.Detail.update({
                num_enrolled: (course.Detail.num_enrolled || 0) + 1,
                updated_at: new Date(),
              });
            }
          }
        }
      }
    }

    return res
      .status(201)
      .json({ message: "Factura registrada exitosamente.", payment: newPayment });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return res.status(500).json({ message: "Error al registrar pago.", error: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { search = "", limit = 15, page = 1, course_id } = req.body;
    const numLimit = Number(limit) || 15;
    const numPage = Number(page) || 1;
    const offset = (numPage - 1) * numLimit;

    const where = {};

    if (course_id) {
      where.course_id = course_id;
    }

    if (search && String(search).trim() !== "") {
      const q = `%${String(search).trim()}%`;
      where[Op.or] = [
        { invoice_number: { [Op.like]: q } },
        { payer_name: { [Op.like]: q } },
        { payer_cid_ruc: { [Op.like]: q } },
        { description: { [Op.like]: q } },
        { amount: { [Op.like]: q } },
      ];
    }

    const payment = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Participant,
          through: { attributes: [] },
          required: false,
        },
        {
          model: Course,
          attributes: ["course_id", "course_name"],
          required: false,
        },
      ],
      order: [["payment_id", "DESC"]],
      limit: numLimit,
      offset: offset,
    });

    return res.status(200).json({
      total: payment.count,
      totalPages: Math.ceil(payment.count / numLimit) || 1,
      payments: payment.rows,
    });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    return res.status(500).json({ message: "Error al listar pagos.", error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ message: notifications.pago.p5 });
    }
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: notifications.pago.p1 });
    }

    // 1. Revertir a estado Inscrito (enrolled = false) en CourseParticipant si estaba vinculado
    const cps = await CourseParticipant.findAll({
      where: {
        [Op.or]: [
          { payment_id: id },
          payment.course_id && payment.invoice_number
            ? { course_id: payment.course_id, invoice_number: payment.invoice_number }
            : { payment_id: id },
        ],
      },
    });

    for (const cp of cps) {
      const wasEnrolled = Boolean(cp.enrolled);
      await cp.update({
        payment_id: null,
        invoice_number: null,
        total_payment: 0.0,
        validation_date: null,
        enrolled: false,
        updated_at: new Date(),
      });

      if (wasEnrolled && cp.course_id) {
        const course = await Course.findByPk(cp.course_id, { include: [{ model: Detail }] });
        if (course && course.Detail) {
          await course.Detail.update({
            num_enrolled: Math.max(0, (course.Detail.num_enrolled || 1) - 1),
            updated_at: new Date(),
          });
        }
      }
    }

    // 2. Eliminar relaciones intermedias en ParticipantPayment
    await ParticipantPayment.destroy({ where: { payment_id: id } });

    // 3. Destruir el registro de pago
    await payment.destroy();

    return res.status(200).json({ message: "Factura eliminada exitosamente y matrícula revertida a pendiente." });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return res.status(500).json({ message: notifications.principal.p1, error: error.message });
  }
};

// export const updatePaymentType = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const payment_type = await PaymentType.findByPk(id);

//     if (!payment_type) {
//       return res.status(404).json({ message: notifications.tipo_pago.tp5 });
//     }

//     if (Object.keys(req.body).length === 0) {
//       return res.status(400).json({ message: notifications.principal.p2 });
//     }

//     const updatedFields = {};

//     for (const field in req.body) {
//       if (PaymentType.rawAttributes[field]) {
//         updatedFields[field] = req.body[field];
//       }
//     }

//     if (Object.keys(updatedFields).length === 0) {
//       return res.status(400).json({ message: notifications.principal.p2 });
//     }

//     await payment_type.update(updatedFields);

//     return res
//       .status(200)
//       .json({ message: notifications.tipo_pago.tp2, payment_type });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: notifications.principal.p1, error });
//   }
// };

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { participant_id } = req.body;

    console.log(req.body);

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ message: notifications.pago.p5 });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: notifications.principal.p2 });
    }

    const updatedFields = {};

    // Actualizar solo los campos válidos del modelo Payment
    for (const field in req.body) {
      if (Payment.rawAttributes[field]) {
        updatedFields[field] = req.body[field];
      }
    }

    // Si hay campos para actualizar, ejecuta la actualización en Payment
    if (Object.keys(updatedFields).length > 0) {
      if (updatedFields.amount !== undefined) {
        const finalAmount = parseFloat(updatedFields.amount) || 0.0;
        if (updatedFields.subtotal === undefined) {
          updatedFields.subtotal = parseFloat((finalAmount / 1.15).toFixed(2));
        }
        if (updatedFields.iva === undefined) {
          updatedFields.iva = parseFloat((finalAmount - updatedFields.subtotal).toFixed(2));
        }
      }
      await payment.update(updatedFields);

      // Sincronizar con CourseParticipant si estaba vinculado
      const cps = await CourseParticipant.findAll({
        where: {
          [Op.or]: [
            { payment_id: id },
            payment.course_id && payment.invoice_number
              ? { course_id: payment.course_id, invoice_number: payment.invoice_number }
              : { payment_id: id },
          ],
        },
      });

      for (const cp of cps) {
        await cp.update({
          invoice_number: payment.invoice_number,
          total_payment: payment.amount,
          validation_date: payment.invoice_date,
          enrolled: true,
          updated_at: new Date(),
        });
      }
    }

    // Actualizar la relación en ParticipantPayment si se proporcionan `participant_id` y `payment_type_id`
    // Actualizar la relación en ParticipantPayment si se proporcionan `participant_id` y `payment_type_id`
    if (participant_id) {
      try {
        const existingRelation = await ParticipantPayment.findOne({
          where: { participant_id: participant_id },
        });

        if (existingRelation) {
          // Actualiza la relación existente
          await existingRelation.update({ participant_id });
        } else {
          // Crea una nueva relación si no existe
          await ParticipantPayment.create({
            participant_id: participant_id,
          });
        }
      } catch (error) {
        console.error(
          "Error al buscar o actualizar ParticipantPayment:",
          error
        );
        return res
          .status(500)
          .json({ message: notifications.principal.p1, error });
      }
    }

    return res.status(200).json({ message: notifications.tema.t2, payment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: notifications.principal.p1, error });
  }
};

export const getPaymentsDropdown = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      attributes: [
        "payment_id",
        "invoice_number",
        "invoice_date",
        "payer_name",
        "payer_cid_ruc",
        "amount",
        "subtotal",
        "iva",
        "course_id",
      ],
      order: [["payment_id", "DESC"]],
      limit: 150,
    });
    return res.status(200).json(payments);
  } catch (error) {
    console.error("Error al obtener facturas de pago:", error);
    return res.status(500).json({ message: "Error al obtener facturas.", error: error.message });
  }
};
