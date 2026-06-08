import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.css']
})
export class ImageGalleryComponent {
  @Input() images: any[] = [];
  @Input() title = 'Galería de imágenes';
  
  @Output() deleteImage = new EventEmitter<any>();

  selectedImage: any = null;
  selectedIndex = 0;

  onImageClick(image: any, index: number) {
    this.selectedImage = image;
    this.selectedIndex = index;
  }

  closeModal() {
    this.selectedImage = null;
  }

  nextImage() {
    if (this.selectedIndex < this.images.length - 1) {
      this.selectedIndex++;
      this.selectedImage = this.images[this.selectedIndex];
    }
  }

  previousImage() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.selectedImage = this.images[this.selectedIndex];
    }
  }

  onDelete(image: any, event: Event) {
    event.stopPropagation();
    this.deleteImage.emit(image);
  }
}
