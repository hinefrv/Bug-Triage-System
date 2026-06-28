package com.gr1.bug_triage_backend.config;

import com.gr1.bug_triage_backend.entity.*;
import com.gr1.bug_triage_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private DeveloperRepository developerRepository;
    @Autowired
    private BugReportRepository bugRepository;
    @Autowired
    private SkillRepository skillRepository;
    @Autowired
    private DeveloperSkillRepository developerSkillRepository;
    @Autowired
    private com.gr1.bug_triage_backend.service.BugReportService bugReportService;

    // Thêm Repository và Encoder để xử lý tài khoản
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // 1. Tạo tài khoản Manager (nếu chưa có)
        if (accountRepository.findByEmail("manager@bugtriage.com").isEmpty()) {
            System.out.println("Đang tạo tài khoản Manager...");
            Account managerAccount = new Account(null, "manager@bugtriage.com", passwordEncoder.encode("123456"),
                    Role.MANAGER, null);
            accountRepository.save(managerAccount);
        }

        // 2. Kiểm tra và nạp Dữ liệu Kỹ năng (Skills)
        if (skillRepository.count() == 0) {
            System.out.println("Đang nạp danh mục Skills...");
            Skill s1 = skillRepository.save(new Skill(null, "java", null, null));
            Skill s2 = skillRepository.save(new Skill(null, "spring", null, null));
            Skill s3 = skillRepository.save(new Skill(null, "react", null, null));
            Skill s4 = skillRepository.save(new Skill(null, "css", null, null));
            Skill s5 = skillRepository.save(new Skill(null, "docker", null, null));
            Skill s6 = skillRepository.save(new Skill(null, "aws", null, null));

            // 3. Nạp Dữ liệu Developer và Tài khoản tương ứng
            if (developerRepository.count() == 0) {
                System.out.println("Đang nạp dữ liệu Developers và Map Skills...");

                // Tạo tài khoản trước
                Account accDev1 = accountRepository.save(
                        new Account(null, "hien@hust.edu.vn", passwordEncoder.encode("123456"), Role.DEVELOPER, null));
                Account accDev2 = accountRepository.save(
                        new Account(null, "huong@hust.edu.vn", passwordEncoder.encode("123456"), Role.DEVELOPER, null));
                Account accDev3 = accountRepository.save(
                        new Account(null, "hieu@hust.edu.vn", passwordEncoder.encode("123456"), Role.DEVELOPER, null));

                // Tạo Developer và liên kết với tài khoản (tham số thứ 7)
                Developer dev1 = developerRepository
                        .save(new Developer(null, "Phạm Hiển", "hien@hust.edu.vn", 0, null, null, accDev1));
                Developer dev2 = developerRepository
                        .save(new Developer(null, "Nguyễn Hương", "huong@hust.edu.vn", 0, null, null, accDev2));
                Developer dev3 = developerRepository
                        .save(new Developer(null, "Lê Hiếu", "hieu@hust.edu.vn", 0, null, null, accDev3));

                // 4. Nối Dev và Skill vào bảng trung gian (DeveloperSkill)
                developerSkillRepository.save(new DeveloperSkill(null, dev1, s1, 5)); // Hiển - Java
                developerSkillRepository.save(new DeveloperSkill(null, dev1, s2, 4)); // Hiển - Spring

                developerSkillRepository.save(new DeveloperSkill(null, dev2, s3, 5)); // Hương - React
                developerSkillRepository.save(new DeveloperSkill(null, dev2, s4, 4)); // Hương - CSS

                developerSkillRepository.save(new DeveloperSkill(null, dev3, s5, 4)); // Hiếu - Docker
                developerSkillRepository.save(new DeveloperSkill(null, dev3, s6, 5)); // Hiếu - AWS
            }
            System.out.println("✅ Nạp dữ liệu Master 3NF thành công!");
        }

        // 5. Nạp dữ liệu Bug Report mẫu nếu chưa có
        if (bugRepository.findByAssignee("hien@hust.edu.vn").isEmpty()) {
            System.out.println("Đang nạp dữ liệu Bug Report mẫu cho hien@hust.edu.vn...");
            
            BugReport bug1 = new BugReport();
            bug1.setBugID("BUG-001");
            bug1.setTitle("Lỗi giao diện trang Login bị vỡ trên Mobile");
            bug1.setDescription("Khi mở bằng Safari trên iOS, các nút bấm bị lẹm ra ngoài màn hình.");
            bug1.setRawText("Lỗi giao diện trang Login bị vỡ trên Mobile Khi mở bằng Safari trên iOS, các nút bấm bị lẹm ra ngoài màn hình.");
            bug1.setStatus("Assigned");
            bug1.setSeverityLabel("P2");
            bug1.setComponentLabel("Frontend");
            bug1.setAssignee("hien@hust.edu.vn");
            bugRepository.save(bug1);

            BugReport bug2 = new BugReport();
            bug2.setBugID("BUG-002");
            bug2.setTitle("NullPointerException khi ấn nút Checkout");
            bug2.setDescription("Hệ thống văng lỗi 500 kèm NullPointerException ở OrderService dòng 45.");
            bug2.setRawText("NullPointerException khi ấn nút Checkout Hệ thống văng lỗi 500 kèm NullPointerException ở OrderService dòng 45.");
            bug2.setStatus("NEW");
            bug2.setSeverityLabel("P4");
            bug2.setComponentLabel("Backend");
            bug2.setAssignee("hien@hust.edu.vn");
            bugRepository.save(bug2);

            BugReport bug3 = new BugReport();
            bug3.setBugID("BUG-003");
            bug3.setTitle("API timeout khi lấy danh sách sản phẩm");
            bug3.setDescription("Endpoint /api/products trả về 504 Gateway Timeout sau 30 giây.");
            bug3.setRawText("API timeout khi lấy danh sách sản phẩm Endpoint /api/products trả về 504 Gateway Timeout sau 30 giây.");
            bug3.setStatus("In Progress");
            bug3.setSeverityLabel("P3");
            bug3.setComponentLabel("API");
            bug3.setAssignee("huong@hust.edu.vn");
            bugRepository.save(bug3);

            System.out.println("✅ Nạp dữ liệu Bug Report mẫu thành công!");
        }

        // 6. Nạp dữ liệu Bug trùng lặp để test tính năng Gom cụm (Clustering)
        if (bugRepository.count() <= 3) {
            System.out.println("Đang nạp 3 Bug Report trùng lặp về Momo để test Clustering...");
            
            BugReport bug4 = new BugReport();
            bug4.setBugID("BUG-004");
            bug4.setTitle("Lỗi không nạp được tiền vào ví Momo");
            bug4.setDescription("Khách hàng báo nạp tiền qua Momo bị trừ tiền ở ngân hàng nhưng không cộng vào ví.");
            bug4.setRawText("Lỗi không nạp được tiền vào ví Momo Khách hàng báo nạp tiền qua Momo bị trừ tiền ở ngân hàng nhưng không cộng vào ví.");
            bug4.setStatus("Open");
            bug4.setSeverityLabel("P2");
            bug4.setAssignee(null); // Chưa gán cho ai để Manager tự Triage
            bugRepository.save(bug4);

            BugReport bug5 = new BugReport();
            bug5.setBugID("BUG-005");
            bug5.setTitle("Momo payment error khi quét QR");
            bug5.setDescription("Quét mã QR Momo tại bước thanh toán báo lỗi hệ thống bận, không quét được.");
            bug5.setRawText("Momo payment error khi quét QR Quét mã QR Momo tại bước thanh toán báo lỗi hệ thống bận, không quét được.");
            bug5.setStatus("Open");
            bug5.setSeverityLabel("P3");
            bug5.setAssignee(null);
            bugRepository.save(bug5);

            BugReport bug6 = new BugReport();
            bug6.setBugID("BUG-006");
            bug6.setTitle("Thanh toán Momo báo lỗi kết nối mạng");
            bug6.setDescription("Ứng dụng quay vòng vòng khi ấn xác nhận thanh toán Momo rồi văng lỗi timeout.");
            bug6.setRawText("Thanh toán Momo báo lỗi kết nối mạng Ứng dụng quay vòng vòng khi ấn xác nhận thanh toán Momo rồi văng lỗi timeout.");
            bug6.setStatus("Open");
            bug6.setSeverityLabel("P2");
            bug6.setAssignee(null);
            bugRepository.save(bug6);

            System.out.println("✅ Đã nạp xong 3 Bug Momo!");
        }

        // 7. Gen Test Data for AI (Gọi qua Service để kích hoạt AI)
        if (bugRepository.count() <= 6) {
            System.out.println("Đang tạo thêm 5 dữ liệu Test đặc biệt để kiểm tra AI Triage...");

            BugReport test1 = new BugReport();
            test1.setBugID("TEST-001");
            test1.setTitle("Nút đăng nhập bị lệch sang trái");
            test1.setDescription("Trên iPhone 14, nút login bị lệch hẳn sang một bên. Cần chỉnh margin css.");
            test1.setSource(null);
            bugReportService.saveBug(test1);

            BugReport test2 = new BugReport();
            test2.setBugID("TEST-002");
            test2.setTitle("Deadlock khi update bảng giao dịch");
            test2.setDescription("Hệ thống SQL văng lỗi deadlock khi update bảng database.");
            test2.setSource(null);
            bugReportService.saveBug(test2);

            BugReport test3 = new BugReport();
            test3.setBugID("TEST-003");
            test3.setTitle("Docker container bị crash vì OOM");
            test3.setDescription("Container chạy service tự nhiên bị kill do Out Of Memory (OOM).");
            test3.setSource(null);
            bugReportService.saveBug(test3);

            BugReport test4 = new BugReport();
            test4.setBugID("TEST-004");
            test4.setTitle("Nạp tiền Momo bị treo chờ");
            test4.setDescription("Người dùng thanh toán bằng Momo xong quay lại app bị màn hình trắng, chờ mãi không xong.");
            test4.setSource(null);
            bugReportService.saveBug(test4);

            BugReport test5 = new BugReport();
            test5.setBugID("TEST-005");
            test5.setTitle("Ứng dụng bị văng khi mở camera");
            test5.setDescription("Lỗi mới. Bấm vào icon máy ảnh trên Android, đen thui rồi crash.");
            test5.setSource(null);
            bugReportService.saveBug(test5);

            System.out.println("✅ Đã tạo xong 5 Test Data qua AI!");
        }

        System.out.println("✅ Quá trình nạp toàn bộ Master Data & Seed Data hoàn tất!");
    }
}
