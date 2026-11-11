import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFileExcel,
  faUpload,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faFileDownload,
} from "@fortawesome/free-solid-svg-icons";
import { importInvoicesBulkRequest } from "../../api/course";

export default function ImportInvoicesModal({
  isOpen,
  onClose,
  courseId,
  onImported,
}) {
  const [invoicesData, setInvoicesData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInvoicesData([]);
      setFileName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (rawJson.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Archivo vacío",
            text: "No se encontraron filas con datos en la hoja seleccionada.",
          });
          return;
        }

        const parsed = rawJson.map((row, idx) => {
          const keys = Object.keys(row);
          const findValue = (...patterns) => {
            const foundKey = keys.find((k) => {
              const cleanKey = k.toLowerCase().trim();
              return patterns.some((p) => cleanKey.includes(p));
            });
            return foundKey ? String(row[foundKey]).trim() : "";
          };

          const factura = findValue("factura", "fact");
          const fecha = findValue("fecha", "date");
          const ruc = findValue("ruc", "cedula", "ci");
          const apellidos = findValue("apellidos/empresa", "apellidos", "empresa");
          const nombre = findValue("nombre", "nombres");
          const v_total = findValue("v. total", "v.total", "subtotal", "valor u");
          const iva = findValue("iva");
          const total = findValue("total");
          const proyecto = findValue("proyecto") || "0607";

          return {
            rowNumber: idx + 1,
            factura,
            fecha,
            ruc,
            apellidos_empresa: apellidos,
            nombre,
            v_total: parseFloat(v_total) || 60.0,
            iva: parseFloat(iva) || 9.0,
            total: parseFloat(total) || (parseFloat(v_total) || 60) + (parseFloat(iva) || 9),
            proyecto,
            valid: Boolean(factura && (ruc || apellidos)),
          };
        });

        setInvoicesData(parsed);
      } catch (err) {
        console.error("Error al procesar archivo de facturas:", err);
        Swal.fire({
          icon: "error",
          title: "Error al leer archivo",
          text: "Asegúrese de cargar un archivo Excel (.xlsx, .xls) válido.",
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const validRows = invoicesData.filter((r) => r.valid);
    if (validRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin filas válidas",
        text: "No se encontraron filas con número de factura y RUC/nombre válidos.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await importInvoicesBulkRequest(courseId, validRows);

      Swal.fire({
        icon: "success",
        title: "Reporte de Facturación Importado",
        html: `
          <p class="text-sm">${res.data.message}</p>
          <div class="mt-2 text-xs text-slate-500">
            Facturas procesadas: <b>${res.data.createdPaymentsCount}</b><br/>
            Estudiantes matriculados por cruce: <b>${res.data.newlyMatchedCount}</b>
          </div>
        `,
        confirmButtonColor: "#6cc24a",
      });

      if (onImported) onImported();
      onClose();
    } catch (err) {
      console.error("Error al importar facturas:", err);
      Swal.fire({
        icon: "error",
        title: "Error al importar",
        text: err.response?.data?.message || "No se pudo procesar el archivo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoiceTemplate = () => {
    const sample = [
      {
        "FACTURA": "100619",
        "FECHA": "27/1/2026",
        "RUC": "1004235634",
        "APELLIDOS/EMPRESA": "ATUPAÑA CEPEDA",
        "NOMBRE": "DYLAN ALEXANDER",
        "CANT": 1,
        "VALOR U": 60,
        "V. TOTAL": 60,
        "IVA": 9,
        "TOTAL": 69.00,
        "PROYECTO": "0607",
      },
      {
        "FACTURA": "100616",
        "FECHA": "26/1/2026",
        "RUC": "0400502472",
        "APELLIDOS/EMPRESA": "CANO ROSERO",
        "NOMBRE": "BENIGNO GILBERT",
        "CANT": 1,
        "VALOR U": 100,
        "V. TOTAL": 100,
        "IVA": 15,
        "TOTAL": 115.00,
        "PROYECTO": "0607",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturacion");
    XLSX.writeFile(wb, "Plantilla_Facturacion_UTN.xlsx");
  };

  const validCount = invoicesData.filter((r) => r.valid).length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileExcel} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Importar Reporte de Facturación
              </h2>
              <p className="text-xs text-slate-500">
                Carga el archivo de tesorería para cruzar facturas y validar matrículas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Estructura Reconocida (Reporte Oficial de Facturación)
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Columnas: FACTURA, FECHA, RUC, APELLIDOS/EMPRESA, NOMBRE, V. TOTAL, IVA, TOTAL, PROYECTO.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadInvoiceTemplate}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faFileDownload} />
              Descargar Formato Excel
            </button>
          </div>

          {invoicesData.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/30 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faFileExcel} className="text-2xl" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Seleccione el archivo de Facturación de Tesorería (.xlsx)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                El sistema asociará automáticamente las facturas con los aspirantes inscritos
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 bg-slate-100 px-3.5 py-2 rounded-xl text-xs border border-gray-200">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileExcel} className="text-emerald-600" />
                  <span className="font-bold text-slate-800">{fileName}</span>
                  <span className="text-slate-500">({invoicesData.length} registros)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInvoicesData([]);
                    setFileName("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Cambiar archivo
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="text-[11px] text-slate-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Factura</th>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">RUC / Cédula</th>
                      <th className="px-3 py-2">Razón Social / Pagador</th>
                      <th className="px-3 py-2 text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoicesData.map((row) => (
                      <tr key={row.rowNumber} className={row.valid ? "hover:bg-slate-50" : "bg-red-50 text-red-700"}>
                        <td className="px-3 py-2 font-mono font-bold text-slate-800">
                          {row.factura}
                        </td>
                        <td className="px-3 py-2 text-slate-500 font-mono">
                          {row.fecha || "—"}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {row.ruc}
                        </td>
                        <td className="px-3 py-2 font-medium">
                          {row.apellidos_empresa} {row.nombre}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-800">
                          ${row.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-medium text-slate-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={submitting || validCount === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FontAwesomeIcon icon={submitting ? faSpinner : faUpload} className={submitting ? "animate-spin" : ""} />
              {submitting ? "Procesando..." : `Cruzar y Validar ${validCount} Facturas`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

