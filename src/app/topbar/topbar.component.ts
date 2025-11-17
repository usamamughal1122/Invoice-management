import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule,FormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  isDarkMode = false;
  currentYear = new Date().getFullYear();
  constructor(private router: Router, private toastr: ToastrService) {}
    logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.toastr.success('Logged out successfully');
  }
  @Input() theme: 'light'|'dark' = 'light';
  @Output() themeChange = new EventEmitter<'light'|'dark'>();



  toggleTheme() {
    this.theme = this.theme==='dark'?'light':'dark';
    this.themeChange.emit(this.theme);
    this.isDarkMode = !this.isDarkMode;
  }




}


// 🧹 Delete all products (backend only)
// app.delete("/api/products", async (req, res) => {
//   try {
//     const result = await Product.deleteMany({});
//     res.status(200).json({
//       message: "All products deleted successfully",
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
