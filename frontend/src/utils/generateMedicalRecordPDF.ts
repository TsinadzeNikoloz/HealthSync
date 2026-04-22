import jsPDF from 'jspdf';
import type { MedicalRecord } from '../types';

export function generateMedicalRecordPDF(record: MedicalRecord): void {
	const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
	const pageW = 210;
	const margin = 20;
	const contentW = pageW - margin * 2;
	let y = 0;

	// ─── Header bar ───────────────────────────────────────────────────────
	// Changed to blue-500: (59, 130, 246)
	doc.setFillColor(59, 130, 246);
	doc.rect(0, 0, pageW, 30, 'F');

	doc.setTextColor(255, 255, 255);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(20);
	doc.text('HealthSync', margin, 14);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8.5);
	doc.text('MEDICAL VISIT SUMMARY', margin, 23);

	doc.setFontSize(7.5);
	doc.text(
		`Record ID: ${record.id.slice(-10).toUpperCase()}`,
		pageW - margin,
		14,
		{ align: 'right' },
	);
	doc.text(
		`Generated: ${new Date().toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})}`,
		pageW - margin,
		23,
		{ align: 'right' },
	);

	y = 40;

	// ─── Patient / Visit info box ─────────────────────────────────────────
	doc.setFillColor(241, 245, 249); // slate-100
	doc.roundedRect(margin, y, contentW, 32, 3, 3, 'F');

	// Patient column
	doc.setTextColor(100, 116, 139); // slate-500
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.text('PATIENT', margin + 6, y + 9);

	doc.setTextColor(30, 41, 59); // slate-800
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	doc.text(record.patient.name, margin + 6, y + 18);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8);
	doc.setTextColor(100, 116, 139);
	doc.text(record.patient.email, margin + 6, y + 26);

	// Date column
	const col2 = margin + 62;
	doc.setTextColor(100, 116, 139);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.text('DATE OF VISIT', col2, y + 9);

	doc.setTextColor(30, 41, 59);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	doc.text(
		new Date(record.appointment.date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}),
		col2,
		y + 18,
	);

	// Service column
	const col3 = margin + 113;
	doc.setTextColor(100, 116, 139);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7);
	doc.text('SERVICE', col3, y + 9);

	doc.setTextColor(30, 41, 59);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(10);
	const svcLines = doc.splitTextToSize(
		record.appointment.service.name,
		contentW - (col3 - margin) - 4,
	);
	doc.text(svcLines[0] as string, col3, y + 18);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7.5);
	doc.setTextColor(100, 116, 139);
	doc.text(record.appointment.service.category, col3, y + 26);

	y += 42;

	// ─── Attending physician ──────────────────────────────────────────────
	doc.setTextColor(100, 116, 139);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(7.5);
	doc.text('ATTENDING PHYSICIAN', margin, y);
	y += 7;

	doc.setTextColor(30, 41, 59);
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(12);
	doc.text(record.doctor.name, margin, y);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8.5);
	doc.setTextColor(100, 116, 139);
	doc.text(record.doctor.email, margin, y + 7);

	y += 20;

	// ─── Divider ─────────────────────────────────────────────────────────
	doc.setDrawColor(226, 232, 240); // slate-200
	doc.setLineWidth(0.5);
	doc.line(margin, y, pageW - margin, y);
	y += 12;

	// ─── Section helper ───────────────────────────────────────────────────
	const drawSection = (
		title: string,
		content: string,
		accentR: number,
		accentG: number,
		accentB: number,
	) => {
		// Accent bar + title
		doc.setFillColor(accentR, accentG, accentB);
		doc.rect(margin, y, 3, 5, 'F');
		doc.setTextColor(accentR, accentG, accentB);
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(8);
		doc.text(title, margin + 7, y + 4);
		y += 10;

		// Content box
		const lines = doc.splitTextToSize(content, contentW - 16) as string[];
		const boxH = Math.max(16, lines.length * 5.5 + 10);

		doc.setFillColor(248, 250, 252); // slate-50
		doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'F');

		doc.setTextColor(30, 41, 59);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(10);
		doc.text(lines, margin + 8, y + 9);

		y += boxH + 10;
	};

	// Diagnosis - Updated to blue-500: (59, 130, 246)
	drawSection('DIAGNOSIS', record.diagnosis, 59, 130, 246);

	// Prescription
	if (record.prescription) {
		drawSection('PRESCRIPTION', record.prescription, 16, 185, 129);
	}

	// Clinical notes
	if (record.notes) {
		drawSection('CLINICAL NOTES', record.notes, 100, 116, 139);
	}

	// ─── Footer ──────────────────────────────────────────────────────────
	doc.setFillColor(241, 245, 249);
	doc.rect(0, 285, pageW, 12, 'F');

	doc.setTextColor(148, 163, 184); // slate-400
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(7);
	doc.text(
		'This document is confidential and intended solely for the named patient.  •  HealthSync Medical System',
		pageW / 2,
		292,
		{ align: 'center' },
	);

	doc.save(`HealthSync-Record-${record.id.slice(-8).toUpperCase()}.pdf`);
}
