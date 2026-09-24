package com.cafeteria.controller.admin;
import com.cafeteria.dto.response.DailySalesReportResponse; import com.cafeteria.service.ReportService; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin/reports") public class AdminReportController{private final ReportService s;public AdminReportController(ReportService s){this.s=s;}@GetMapping("/today")public DailySalesReportResponse today(){return s.getTodaysSalesReport();}}
