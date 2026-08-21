import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ColorService } from '../../services/color.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  projectId: string | null = null;
  project: any = null;
  colors: any[] = [];
  selectedColor: any = null;

  // Canvas context and state
  private ctx!: CanvasRenderingContext2D;
  private image: HTMLImageElement = new Image();
  
  // Polygon state
  polygonPoints: {x: number, y: number}[] = [];
  isDrawing = false;
  isPolygonClosed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private colorService: ColorService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.loadColors();
    if (this.projectId) {
      this.loadProject();
    }
  }

  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    }
  }

  loadColors() {
    this.colorService.getColors().subscribe(data => this.colors = data);
  }

  loadProject() {
    this.projectService.getProject(this.projectId!).subscribe({
      next: (data) => {
        this.project = data;
        if (data.wallSelection) {
          this.polygonPoints = data.wallSelection.points || [];
          this.isPolygonClosed = data.wallSelection.isClosed || false;
        }
        if (data.appliedColor) {
          this.selectedColor = data.appliedColor;
        }
        this.loadImage('http://localhost:5000' + data.originalImageUrl);
      },
      error: (err) => console.error(err)
    });
  }

  loadImage(src: string) {
    this.image.crossOrigin = 'Anonymous';
    this.image.onload = () => {
      const canvas = this.canvasRef.nativeElement;
      // Scale canvas to fit container while maintaining aspect ratio (simplified here)
      canvas.width = 800;
      canvas.height = (this.image.height / this.image.width) * 800;
      
      this.redraw();
    };
    this.image.src = src;
  }

  redraw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    
    // 1. Draw original image
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);

    // 2. Draw polygon if exists
    if (this.polygonPoints.length > 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.polygonPoints[0].x, this.polygonPoints[0].y);
      for (let i = 1; i < this.polygonPoints.length; i++) {
        this.ctx.lineTo(this.polygonPoints[i].x, this.polygonPoints[i].y);
      }

      if (this.isPolygonClosed) {
        this.ctx.closePath();
        
        // If color selected, apply multiply blending
        if (this.selectedColor) {
          this.ctx.save();
          this.ctx.clip(); // Clip to polygon area
          
          this.ctx.globalCompositeOperation = 'multiply';
          this.ctx.fillStyle = this.selectedColor.hexCode;
          this.ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          this.ctx.restore();
        } else {
          // Just draw the outline if closed but no color
          this.ctx.strokeStyle = '#3498db';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          this.ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
          this.ctx.fill();
        }
      } else {
        // Draw lines and points while drawing
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.polygonPoints.forEach(p => {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          this.ctx.fillStyle = '#e74c3c';
          this.ctx.fill();
        });
      }
    }
  }

  onCanvasClick(event: MouseEvent) {
    if (this.isPolygonClosed) return; // Reset needed to draw again

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Check if clicked near start point to close polygon
    if (this.polygonPoints.length > 2) {
      const startPoint = this.polygonPoints[0];
      const dist = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
      if (dist < 20) { // 20px threshold to close
        this.isPolygonClosed = true;
        this.redraw();
        return;
      }
    }

    this.polygonPoints.push({x, y});
    this.redraw();
  }

  resetSelection() {
    this.polygonPoints = [];
    this.isPolygonClosed = false;
    this.redraw();
  }

  selectColor(color: any) {
    this.selectedColor = color;
    this.redraw();
  }

  saveProject() {
    if (!this.projectId) return;

    const previewDataUrl = this.canvasRef.nativeElement.toDataURL('image/jpeg', 0.8);

    const payload = {
      wallSelection: { points: this.polygonPoints, isClosed: this.isPolygonClosed },
      appliedColor: this.selectedColor?._id,
      colorSettings: { hexCode: this.selectedColor?.hexCode },
      previewImageUrl: previewDataUrl
    };

    this.projectService.saveProject(this.projectId, payload).subscribe({
      next: () => {
        alert('Project saved successfully!');
      },
      error: (err) => console.error(err)
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
