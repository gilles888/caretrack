import { Injectable } from '@angular/core';
import { EvolutionPoint } from './analytics.service';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportCSV(
    patientId: string,
    templateCode: string,
    dateRange: [Date, Date],
    data: EvolutionPoint[]
  ): void {
    const domaines = this.getDomaines(data);
    const headers = ['Date', 'Score global', 'Alertes', ...domaines];
    const rows = data.map(p => [
      new Date(p.date).toLocaleDateString('fr-FR'),
      p.scoreGlobal?.toString() ?? '',
      p.alerteNiveaux.join(';'),
      ...domaines.map(d => (p.scores[d] ?? '').toString()),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caretrack_${patientId}_${templateCode}_${dateRange[0].toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPDF(): void {
    window.print();
  }

  private getDomaines(data: EvolutionPoint[]): string[] {
    const domaines = new Set<string>();
    data.forEach(p => Object.keys(p.scores ?? {}).forEach(d => domaines.add(d)));
    return Array.from(domaines);
  }
}
