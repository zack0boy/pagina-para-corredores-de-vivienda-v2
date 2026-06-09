import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() isLoading = false;
  @Input() actions: 'none' | 'edit' | 'delete' | 'both' = 'both';
  
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  displayColumns: string[] = [];

  ngOnInit() {
    this.displayColumns = this.columns.map(c => c.key);
    if (this.actions !== 'none') {
      this.displayColumns.push('actions');
    }
  }

  getColumnLabel(key: string): string {
    const col = this.columns.find(c => c.key === key);
    return col ? col.label : key;
  }

  getValue(row: any, key: string): any {
    return row[key];
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }
}
