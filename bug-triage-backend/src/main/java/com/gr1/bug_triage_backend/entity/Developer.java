package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "developers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Developer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long devID;

    private String name;
    private String email;

    // Thuộc tính cập nhật tự động khi fix xong lỗi
    private Integer resolvedBugsCount = 0;

    @OneToMany(mappedBy = "developer")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Assignment> assignments;

    // Nối tới bảng trung gian N-N
    @OneToMany(mappedBy = "developer", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DeveloperSkill> developerSkills;

    @OneToOne
    @JoinColumn(name = "account_id")
    private Account account;
}