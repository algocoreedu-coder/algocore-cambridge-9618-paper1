"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button, Select } from "@/app/components/algocore-ui";
import {
  AI_IMPACT_DIMENSIONS,
  AI_USE_CASES,
  ETHICS_ACTIONS,
  ETHICS_FIXTURES,
  ETHICS_SCENARIOS,
  LICENCE_PROFILES,
  LICENCE_SCENARIOS,
  aiFacts,
  aiFrames,
  ethicsFrames,
  licenceFacts,
  licenceFrames,
  type AiDimension,
  type AiUseCase,
  type EthicsAction,
  type EthicsScenario,
  type LicenceFit,
  type LicenceProfile,
  type LicenceScenario,
} from "@/app/lib/paper1/chapter7-models";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./Chapter7VisualLab.module.css";

type LocalText = Readonly<{ en: string; vi: string }>;
type ReceiptEntry = Readonly<{ label: string; value: string | number; current?: boolean; evidenceTicket?: string }>;
type Scene = Readonly<{ sceneId: string; title: string; explanation: string; graphic: ReactNode; receipt: readonly ReceiptEntry[] }>;
type Prediction = Readonly<{
  prompt: string;
  responsePrompt: string;
  choices: readonly Readonly<{ id: string; label: string }>[];
  expectedChoiceId: string;
  rubric: readonly string[];
}>;
type ChainNode = Readonly<{ id: string; eyebrow: string; value: string }>;

const copy = (locale: Paper1Locale, en: string, vi: string) => locale === "vi" ? vi : en;
const local = (locale: Paper1Locale, value: LocalText) => value[locale];
const localList = (locale: Paper1Locale, values: readonly LocalText[]) => values.map((value) => local(locale, value)).join(" · ");
const ticketReceipt = (ticket: string, entries: readonly ReceiptEntry[]): readonly ReceiptEntry[] => entries.map(
  (entry) => entry.current ? { ...entry, evidenceTicket: ticket } : entry,
);

const ETHICS_SCENARIO_COPY: Readonly<Record<EthicsScenario, Readonly<{
  title: LocalText; role: LocalText; facts: readonly LocalText[]; stakeholders: readonly LocalText[];
}>>> = {
  "unsafe-release": {
    title: { en: "Pressure to release unsafe software", vi: "Áp lực phát hành phần mềm chưa an toàn" },
    role: { en: "Release engineer", vi: "Kỹ sư phụ trách phát hành" },
    facts: [
      { en: "A repeatable safety defect remains unresolved.", vi: "Một lỗi an toàn có thể lặp lại vẫn chưa được xử lý." },
      { en: "A manager requests release before the deadline.", vi: "Quản lý yêu cầu phát hành trước hạn." },
      { en: "Users depend on safe operation.", vi: "Người dùng phụ thuộc vào hoạt động an toàn." },
    ],
    stakeholders: [{ en: "Public users", vi: "Người dùng công chúng" }, { en: "Client and employer", vi: "Khách hàng và tổ chức sử dụng lao động" }, { en: "Engineering team", vi: "Đội kỹ thuật" }],
  },
  "confidential-code-reuse": {
    title: { en: "Reusing confidential employer code", vi: "Tái sử dụng mã nguồn bí mật của tổ chức" },
    role: { en: "Software developer", vi: "Lập trình viên" },
    facts: [
      { en: "The employer's code is confidential.", vi: "Mã nguồn của tổ chức là thông tin bí mật." },
      { en: "The developer wants similar functionality in a side project.", vi: "Lập trình viên muốn chức năng tương tự cho dự án riêng." },
      { en: "No permission has been granted.", vi: "Chưa có sự cho phép nào được cấp." },
    ],
    stakeholders: [{ en: "Employer and client", vi: "Tổ chức và khách hàng" }, { en: "Colleagues", vi: "Đồng nghiệp" }, { en: "Developer and profession", vi: "Lập trình viên và nghề nghiệp" }],
  },
  "known-bias-error": {
    title: { en: "Known bias or error evidence", vi: "Bằng chứng về thiên lệch hoặc lỗi đã biết" },
    role: { en: "Model evaluation analyst", vi: "Chuyên viên đánh giá mô hình" },
    facts: [
      { en: "Repeatable bias or error evidence has been found.", vi: "Đã tìm thấy bằng chứng thiên lệch hoặc lỗi có thể lặp lại." },
      { en: "The system affects applicant ranking.", vi: "Hệ thống ảnh hưởng đến xếp hạng ứng viên." },
      { en: "The team has not reviewed the evidence yet.", vi: "Nhóm chưa xem xét bằng chứng này." },
    ],
    stakeholders: [{ en: "Affected applicants", vi: "Ứng viên bị ảnh hưởng" }, { en: "Client and employer", vi: "Khách hàng và tổ chức" }, { en: "Public and profession", vi: "Công chúng và nghề nghiệp" }],
  },
};

const ETHICS_ACTION_COPY: Readonly<Record<EthicsAction, Readonly<{
  label: LocalText; change: LocalText; duties: readonly LocalText[]; effects: readonly LocalText[];
  evidence: LocalText; condition: LocalText; argument: LocalText;
}>>> = {
  "report-and-delay": {
    label: { en: "Report the defect and request delay/retesting", vi: "Báo cáo lỗi và yêu cầu hoãn/kiểm thử lại" },
    change: { en: "The defect is documented; release pauses for retesting.", vi: "Lỗi được ghi nhận; việc phát hành tạm dừng để kiểm thử lại." },
    duties: [{ en: "Public interest and safety", vi: "Lợi ích công chúng và an toàn" }, { en: "Competence and integrity", vi: "Năng lực và tính chính trực" }, { en: "Honest reporting", vi: "Báo cáo trung thực" }],
    effects: [{ en: "Users avoid a known unresolved risk.", vi: "Người dùng tránh được rủi ro đã biết nhưng chưa xử lý." }, { en: "The client receives an accurate status.", vi: "Khách hàng nhận được trạng thái chính xác." }, { en: "The team can retest and correct.", vi: "Nhóm có thể kiểm thử lại và sửa lỗi." }],
    evidence: { en: "The known defect is disclosed before release.", vi: "Lỗi đã biết được công bố trước khi phát hành." },
    condition: { en: "Delay has costs, but deadline pressure does not remove the duty to report known risk.", vi: "Việc hoãn có chi phí, nhưng áp lực thời hạn không loại bỏ nghĩa vụ báo cáo rủi ro đã biết." },
    argument: { en: "This action supports professional duty because it records the known risk for users, client and team before release.", vi: "Hành động này hỗ trợ nghĩa vụ nghề nghiệp vì ghi nhận rủi ro đã biết cho người dùng, khách hàng và nhóm trước khi phát hành." },
  },
  "conceal-and-release": {
    label: { en: "Conceal the defect and approve release", vi: "Che giấu lỗi và phê duyệt phát hành" },
    change: { en: "The defect is omitted and the release is approved.", vi: "Lỗi bị bỏ khỏi báo cáo và bản phát hành được phê duyệt." },
    duties: [{ en: "Public interest and safety", vi: "Lợi ích công chúng và an toàn" }, { en: "Competence and integrity", vi: "Năng lực và tính chính trực" }, { en: "Honest reporting", vi: "Báo cáo trung thực" }],
    effects: [{ en: "Users face an undisclosed known risk.", vi: "Người dùng đối mặt với rủi ro đã biết nhưng không được công bố." }, { en: "The client receives an incomplete status.", vi: "Khách hàng nhận trạng thái không đầy đủ." }, { en: "The team loses the chance to retest before release.", vi: "Nhóm mất cơ hội kiểm thử lại trước phát hành." }],
    evidence: { en: "Material safety evidence is hidden from affected stakeholders.", vi: "Bằng chứng an toàn quan trọng bị che giấu khỏi các bên liên quan." },
    condition: { en: "Meeting a deadline does not make the known defect safe.", vi: "Đáp ứng thời hạn không làm lỗi đã biết trở nên an toàn." },
    argument: { en: "This action conflicts with professional duty because it hides material risk from affected stakeholders.", vi: "Hành động này xung đột với nghĩa vụ nghề nghiệp vì che giấu rủi ro quan trọng khỏi các bên bị ảnh hưởng." },
  },
  "permission-or-reimplement": {
    label: { en: "Seek permission or use an independent licensed implementation", vi: "Xin phép hoặc dùng bản triển khai độc lập có giấy phép" },
    change: { en: "Permission is requested or independently licensed code is selected.", vi: "Quyền sử dụng được yêu cầu hoặc mã độc lập có giấy phép được chọn." },
    duties: [{ en: "Duty to employer and client", vi: "Nghĩa vụ với tổ chức và khách hàng" }, { en: "Respect intellectual property", vi: "Tôn trọng sở hữu trí tuệ" }, { en: "Honesty and credit", vi: "Trung thực và ghi nhận đóng góp" }],
    effects: [{ en: "The employer retains control of confidential work.", vi: "Tổ chức giữ quyền kiểm soát công việc bí mật." }, { en: "Colleague contributions are not misappropriated.", vi: "Đóng góp của đồng nghiệp không bị chiếm dụng." }, { en: "The code origin stays auditable.", vi: "Nguồn gốc mã vẫn có thể kiểm chứng." }],
    evidence: { en: "Authorisation and an auditable origin are preserved.", vi: "Việc cấp quyền và nguồn gốc có thể kiểm chứng được duy trì." },
    condition: { en: "Permission and the applicable licence terms must be checked, not assumed.", vi: "Phải kiểm tra sự cho phép và điều khoản giấy phép áp dụng, không được tự suy đoán." },
    argument: { en: "This action supports professional duty because confidential work and contributions remain authorised and credited.", vi: "Hành động này hỗ trợ nghĩa vụ nghề nghiệp vì công việc bí mật và đóng góp vẫn được cấp quyền và ghi nhận." },
  },
  "copy-without-permission": {
    label: { en: "Copy the code without permission or credit", vi: "Sao chép mã không có phép hoặc ghi nhận" },
    change: { en: "Confidential code enters the side project without permission or credit.", vi: "Mã bí mật được đưa vào dự án riêng không có phép hoặc ghi nhận." },
    duties: [{ en: "Duty to employer and client", vi: "Nghĩa vụ với tổ chức và khách hàng" }, { en: "Respect intellectual property", vi: "Tôn trọng sở hữu trí tuệ" }, { en: "Honesty and credit", vi: "Trung thực và ghi nhận đóng góp" }],
    effects: [{ en: "The employer loses control of confidential work.", vi: "Tổ chức mất quyền kiểm soát công việc bí mật." }, { en: "Colleague contributions are used without credit.", vi: "Đóng góp của đồng nghiệp bị dùng mà không ghi nhận." }, { en: "Trust in the developer and profession is damaged.", vi: "Niềm tin vào lập trình viên và nghề nghiệp bị tổn hại." }],
    evidence: { en: "Confidential work is used without authorisation.", vi: "Công việc bí mật bị sử dụng mà không được cho phép." },
    condition: { en: "Technical ability to copy does not create permission to use or distribute.", vi: "Khả năng sao chép về kỹ thuật không tạo ra quyền sử dụng hoặc phân phối." },
    argument: { en: "This action conflicts with professional duty because it disregards authorisation, credit and employer trust.", vi: "Hành động này xung đột với nghĩa vụ nghề nghiệp vì bỏ qua sự cho phép, ghi nhận và niềm tin của tổ chức." },
  },
  "document-and-escalate": {
    label: { en: "Document the evidence and escalate for review", vi: "Ghi nhận bằng chứng và chuyển cấp để xem xét" },
    change: { en: "Evidence and limitations are recorded for independent review.", vi: "Bằng chứng và giới hạn được ghi lại để xem xét độc lập." },
    duties: [{ en: "Honest and realistic claims", vi: "Tuyên bố trung thực và thực tế" }, { en: "Fair treatment", vi: "Đối xử công bằng" }, { en: "Public interest", vi: "Lợi ích công chúng" }],
    effects: [{ en: "Applicants gain a review path.", vi: "Ứng viên có con đường xem xét lại." }, { en: "The client receives a qualified claim.", vi: "Khách hàng nhận tuyên bố có điều kiện." }, { en: "The correction process remains auditable.", vi: "Quy trình sửa chữa vẫn có thể kiểm chứng." }],
    evidence: { en: "Repeatable evidence is retained and opened to review.", vi: "Bằng chứng có thể lặp lại được giữ lại và mở cho việc xem xét." },
    condition: { en: "Escalation enables investigation; it does not by itself prove the system is fair.", vi: "Chuyển cấp cho phép điều tra; tự nó không chứng minh hệ thống công bằng." },
    argument: { en: "This action supports professional duty because the known limitation is open to review and correction.", vi: "Hành động này hỗ trợ nghĩa vụ nghề nghiệp vì giới hạn đã biết được mở để xem xét và sửa chữa." },
  },
  "suppress-evidence": {
    label: { en: "Suppress the evidence and claim no known issue", vi: "Che giấu bằng chứng và tuyên bố không có vấn đề đã biết" },
    change: { en: "Evidence is removed and the system is described without the known limitation.", vi: "Bằng chứng bị xóa và hệ thống được mô tả mà không nêu giới hạn đã biết." },
    duties: [{ en: "Honest and realistic claims", vi: "Tuyên bố trung thực và thực tế" }, { en: "Fair treatment", vi: "Đối xử công bằng" }, { en: "Public interest", vi: "Lợi ích công chúng" }],
    effects: [{ en: "Applicants lose a review path.", vi: "Ứng viên mất con đường xem xét lại." }, { en: "The client receives an unqualified claim.", vi: "Khách hàng nhận tuyên bố không có điều kiện." }, { en: "Auditable evidence is lost.", vi: "Bằng chứng có thể kiểm chứng bị mất." }],
    evidence: { en: "Known counter-evidence is removed from decision-makers.", vi: "Bằng chứng phản biện đã biết bị loại khỏi người ra quyết định." },
    condition: { en: "Commercial or schedule pressure does not turn an unsupported claim into evidence.", vi: "Áp lực thương mại hoặc tiến độ không biến tuyên bố thiếu căn cứ thành bằng chứng." },
    argument: { en: "This action conflicts with professional duty because known limitations are hidden from affected users and decision-makers.", vi: "Hành động này xung đột với nghĩa vụ nghề nghiệp vì giới hạn đã biết bị che giấu khỏi người dùng và người ra quyết định." },
  },
};

const ETHICS_LEGAL_COPY: Readonly<Record<EthicsAction, Readonly<{
  boundary: LocalText; evidence: LocalText;
}>>> = {
  "report-and-delay": {
    boundary: { en: "Applicable safety rules, contracts and release authority require context-specific review.", vi: "Quy định an toàn, hợp đồng và thẩm quyền phát hành áp dụng cần được xem xét theo bối cảnh." },
    evidence: { en: "The known defect and documented escalation are facts for authorised legal or contract review; no legal verdict is inferred.", vi: "Lỗi đã biết và việc chuyển cấp có ghi nhận là dữ kiện cho người có thẩm quyền xem xét pháp lý hoặc hợp đồng; không suy ra kết luận pháp lý." },
  },
  "conceal-and-release": {
    boundary: { en: "Applicable safety rules, contracts and release authority require context-specific review.", vi: "Quy định an toàn, hợp đồng và thẩm quyền phát hành áp dụng cần được xem xét theo bối cảnh." },
    evidence: { en: "The known defect and omitted report are facts for authorised legal or contract review; no legal verdict is inferred.", vi: "Lỗi đã biết và việc bỏ khỏi báo cáo là dữ kiện cho người có thẩm quyền xem xét pháp lý hoặc hợp đồng; không suy ra kết luận pháp lý." },
  },
  "permission-or-reimplement": {
    boundary: { en: "Ownership, confidentiality, contract and specific licence terms require context-specific review.", vi: "Quyền sở hữu, bảo mật, hợp đồng và điều khoản giấy phép cụ thể cần được xem xét theo bối cảnh." },
    evidence: { en: "The permission request or independently licensed origin is recorded for authorised review; no legal verdict is inferred.", vi: "Yêu cầu cấp phép hoặc nguồn gốc độc lập có giấy phép được ghi nhận để người có thẩm quyền xem xét; không suy ra kết luận pháp lý." },
  },
  "copy-without-permission": {
    boundary: { en: "Ownership, confidentiality, contract and specific licence terms require context-specific review.", vi: "Quyền sở hữu, bảo mật, hợp đồng và điều khoản giấy phép cụ thể cần được xem xét theo bối cảnh." },
    evidence: { en: "The absence of permission and recorded code origin are facts for authorised review; no legal verdict is inferred.", vi: "Việc chưa có phép và nguồn gốc mã đã ghi nhận là dữ kiện để người có thẩm quyền xem xét; không suy ra kết luận pháp lý." },
  },
  "document-and-escalate": {
    boundary: { en: "Applicable equality, data-protection, sector rules and contracts require context-specific review.", vi: "Quy định áp dụng về bình đẳng, bảo vệ dữ liệu, lĩnh vực và hợp đồng cần được xem xét theo bối cảnh." },
    evidence: { en: "Repeatable test evidence, ranking use and disclosure status are recorded for authorised review; no legal verdict is inferred.", vi: "Bằng chứng kiểm thử có thể lặp lại, việc dùng để xếp hạng và trạng thái công bố được ghi nhận để người có thẩm quyền xem xét; không suy ra kết luận pháp lý." },
  },
  "suppress-evidence": {
    boundary: { en: "Applicable equality, data-protection, sector rules and contracts require context-specific review.", vi: "Quy định áp dụng về bình đẳng, bảo vệ dữ liệu, lĩnh vực và hợp đồng cần được xem xét theo bối cảnh." },
    evidence: { en: "Repeatable test evidence, ranking use and suppression status are facts for authorised review; no legal verdict is inferred.", vi: "Bằng chứng kiểm thử có thể lặp lại, việc dùng để xếp hạng và trạng thái che giấu là dữ kiện để người có thẩm quyền xem xét; không suy ra kết luận pháp lý." },
  },
};

const LICENCE_SCENARIO_COPY: Readonly<Record<LicenceScenario, Readonly<{
  title: LocalText; holder: LocalText; needs: readonly LocalText[]; copyright: LocalText;
}>>> = {
  "community-accessibility": { title: { en: "Community accessibility tool", vi: "Công cụ hỗ trợ tiếp cận cho cộng đồng" }, holder: { en: "Community tool authors", vi: "Nhóm tác giả công cụ cộng đồng" }, needs: [{ en: "Run", vi: "Chạy" }, { en: "Inspect source", vi: "Xem mã nguồn" }, { en: "Modify", vi: "Sửa đổi" }, { en: "Redistribute adaptations", vi: "Phân phối bản điều chỉnh" }, { en: "User freedom is the priority", vi: "Quyền tự do người dùng là ưu tiên" }], copyright: { en: "Copyright protects rightsholder control while a licence grants declared permissions.", vi: "Bản quyền bảo vệ quyền kiểm soát của chủ thể quyền, còn giấy phép cấp các quyền đã nêu." } },
  "collaborative-library": { title: { en: "Collaborative developer library", vi: "Thư viện phát triển cộng tác" }, holder: { en: "Cross-organisation contributors", vi: "Những người đóng góp từ nhiều tổ chức" }, needs: [{ en: "Source access", vi: "Truy cập mã nguồn" }, { en: "Derived works", vi: "Tác phẩm phái sinh" }, { en: "Redistribution", vi: "Phân phối lại" }, { en: "Cross-organisation contribution", vi: "Đóng góp liên tổ chức" }, { en: "Paid support allowed", vi: "Cho phép hỗ trợ có thu phí" }], copyright: { en: "Copyright lets contributors authorise collaboration through licence terms.", vi: "Bản quyền cho phép người đóng góp cấp quyền cộng tác thông qua điều khoản giấy phép." } },
  "classroom-trial": { title: { en: "Classroom utility trial", vi: "Dùng thử tiện ích lớp học" }, holder: { en: "Classroom utility vendor", vi: "Nhà cung cấp tiện ích lớp học" }, needs: [{ en: "Evaluate for 30 days", vi: "Đánh giá trong 30 ngày" }, { en: "Full features after payment", vi: "Đầy đủ tính năng sau thanh toán" }, { en: "No source change required", vi: "Không cần sửa mã nguồn" }, { en: "Classroom-use terms", vi: "Điều khoản dùng trong lớp" }], copyright: { en: "Copyright protects the work while the licence defines evaluation and continuing use.", vi: "Bản quyền bảo vệ tác phẩm, còn giấy phép xác định việc dùng thử và sử dụng tiếp." } },
  "payroll-deployment": { title: { en: "Payroll deployment", vi: "Triển khai phần mềm tính lương" }, holder: { en: "Payroll package rightsholder", vi: "Chủ thể quyền của gói tính lương" }, needs: [{ en: "80 authorised staff", vi: "80 nhân viên được cấp quyền" }, { en: "Paid accountable support", vi: "Hỗ trợ có thu phí và trách nhiệm rõ ràng" }, { en: "No source change required", vi: "Không cần sửa mã nguồn" }, { en: "Multi-user deployment rights", vi: "Quyền triển khai nhiều người dùng" }], copyright: { en: "Copyright protects rightsholder control while deployment terms define users, devices and support.", vi: "Bản quyền bảo vệ quyền kiểm soát, còn điều khoản triển khai xác định người dùng, thiết bị và hỗ trợ." } },
};

const LICENCE_PROFILE_COPY: Readonly<Record<LicenceProfile, Readonly<{
  title: LocalText; permissions: readonly LocalText[]; conditions: readonly LocalText[]; overlap: LocalText;
}>>> = {
  "fsf-free-software": { title: { en: "FSF-aligned free software", vi: "Phần mềm tự do theo định hướng FSF" }, permissions: [{ en: "Run for any purpose", vi: "Chạy cho mọi mục đích" }, { en: "Study source", vi: "Nghiên cứu mã nguồn" }, { en: "Modify", vi: "Sửa đổi" }, { en: "Redistribute original and modified copies", vi: "Phân phối bản gốc và bản sửa đổi" }], conditions: [{ en: "Specific licence terms still apply", vi: "Điều khoản giấy phép cụ thể vẫn áp dụng" }, { en: "Freedom does not mean zero price", vi: "Tự do không đồng nghĩa giá bằng không" }], overlap: { en: "Free software can also be open source and sold commercially.", vi: "Phần mềm tự do cũng có thể là mã nguồn mở và được bán thương mại." } },
  "osi-open-source": { title: { en: "OSI-approved open source", vi: "Mã nguồn mở được OSI công nhận" }, permissions: [{ en: "Source under an approved licence", vi: "Mã nguồn theo giấy phép được công nhận" }, { en: "Redistribution", vi: "Phân phối lại" }, { en: "Derived works", vi: "Tác phẩm phái sinh" }, { en: "Collaborative development", vi: "Phát triển cộng tác" }], conditions: [{ en: "Specific approved licence terms still apply", vi: "Điều khoản giấy phép cụ thể vẫn áp dụng" }, { en: "Source visibility alone is not the whole definition", vi: "Chỉ nhìn thấy mã nguồn chưa phải toàn bộ định nghĩa" }], overlap: { en: "Open-source software can also be free software and sold commercially.", vi: "Phần mềm mã nguồn mở cũng có thể là phần mềm tự do và được bán thương mại." } },
  "shareware-trial": { title: { en: "Shareware / trial", vi: "Shareware / phần mềm dùng thử" }, permissions: [{ en: "Evaluate for the declared trial or feature limit", vi: "Đánh giá theo thời hạn hoặc giới hạn tính năng" }, { en: "Continue or unlock after payment if terms allow", vi: "Tiếp tục hoặc mở khóa sau thanh toán nếu điều khoản cho phép" }], conditions: [{ en: "Normally proprietary and copyrighted", vi: "Thường là phần mềm độc quyền và có bản quyền" }, { en: "Source modification or redistribution is not implied", vi: "Không mặc nhiên có quyền sửa hoặc phân phối mã nguồn" }], overlap: { en: "Trial permission alone does not grant production-deployment rights.", vi: "Riêng quyền dùng thử không cấp quyền triển khai thực tế." } },
  "proprietary-commercial": { title: { en: "Proprietary commercial", vi: "Phần mềm thương mại độc quyền" }, permissions: [{ en: "Use under paid user/device/site terms", vi: "Sử dụng theo điều khoản trả phí cho người dùng/thiết bị/site" }, { en: "Vendor support when the contract includes it", vi: "Hỗ trợ từ nhà cung cấp khi hợp đồng có quy định" }], conditions: [{ en: "Source and modification rights are not assumed", vi: "Không mặc nhiên có quyền xem hoặc sửa mã nguồn" }, { en: "Deployment count must match the licence", vi: "Số lượng triển khai phải khớp giấy phép" }], overlap: { en: "Commercial is a business model; this profile is the proprietary Cambridge contrast.", vi: "Thương mại là mô hình kinh doanh; profile này là dạng độc quyền dùng cho đối chiếu Cambridge." } },
};

const FIT_COPY: Readonly<Record<LicenceFit, LocalText>> = {
  "strong-match": { en: "Strong match to the declared needs", vi: "Khớp mạnh với nhu cầu đã nêu" },
  "possible-with-terms": { en: "Possible with additional terms", vi: "Có thể phù hợp nếu có thêm điều khoản" },
  "does-not-meet-stated-needs": { en: "Does not meet the stated needs", vi: "Không đáp ứng nhu cầu đã nêu" },
};

const LICENCE_ASSESSMENT_COPY: Readonly<Record<`${LicenceScenario}:${LicenceProfile}`, Readonly<{ evidence: LocalText; unresolved: LocalText }>>> = {
  "community-accessibility:fsf-free-software": { evidence: { en: "The four freedoms directly match run, inspect, modify and redistribute needs.", vi: "Bốn quyền tự do khớp trực tiếp với nhu cầu chạy, xem, sửa và phân phối lại." }, unresolved: { en: "Check the specific free-software licence obligations.", vi: "Kiểm tra nghĩa vụ của giấy phép phần mềm tự do cụ thể." } },
  "community-accessibility:osi-open-source": { evidence: { en: "Approved open-source permissions match source, modification and redistribution needs.", vi: "Quyền mã nguồn mở được công nhận khớp nhu cầu xem mã, sửa đổi và phân phối lại." }, unresolved: { en: "Check the specific OSI-approved licence obligations.", vi: "Kiểm tra nghĩa vụ của giấy phép được OSI công nhận." } },
  "community-accessibility:shareware-trial": { evidence: { en: "Trial use does not supply the required source, modification and redistribution freedoms.", vi: "Quyền dùng thử không cung cấp các quyền xem mã, sửa đổi và phân phối lại cần thiết." }, unresolved: { en: "Source access, modification and redistribution remain ungranted.", vi: "Quyền xem mã, sửa đổi và phân phối lại chưa được cấp." } },
  "community-accessibility:proprietary-commercial": { evidence: { en: "Payment can authorise use, but this profile does not establish the required source freedoms.", vi: "Thanh toán có thể cấp quyền sử dụng, nhưng profile này không xác lập các quyền tự do mã nguồn cần thiết." }, unresolved: { en: "Source, modification and redistribution permissions need explicit terms.", vi: "Quyền xem mã, sửa đổi và phân phối lại cần điều khoản rõ ràng." } },
  "collaborative-library:fsf-free-software": { evidence: { en: "Free-software freedoms support reuse, but collaboration and support terms still need definition.", vi: "Các quyền tự do hỗ trợ tái sử dụng, nhưng điều khoản cộng tác và hỗ trợ vẫn cần xác định." }, unresolved: { en: "Choose a contribution process and support contract.", vi: "Chọn quy trình đóng góp và hợp đồng hỗ trợ." } },
  "collaborative-library:osi-open-source": { evidence: { en: "The profile directly supports derived works, redistribution and collaboration.", vi: "Profile hỗ trợ trực tiếp tác phẩm phái sinh, phân phối lại và cộng tác." }, unresolved: { en: "Choose the approved licence and contribution process.", vi: "Chọn giấy phép được công nhận và quy trình đóng góp." } },
  "collaborative-library:shareware-trial": { evidence: { en: "A proprietary trial does not establish the collaboration permissions.", vi: "Bản dùng thử độc quyền không xác lập các quyền cộng tác." }, unresolved: { en: "Source, derived-work, redistribution and contribution rights remain ungranted.", vi: "Quyền xem mã, tạo bản phái sinh, phân phối lại và đóng góp chưa được cấp." } },
  "collaborative-library:proprietary-commercial": { evidence: { en: "Commercial support may fit, but this profile does not grant collaboration rights.", vi: "Hỗ trợ thương mại có thể phù hợp, nhưng profile này không cấp quyền cộng tác." }, unresolved: { en: "Source, derived-work, redistribution and contribution terms are required.", vi: "Cần điều khoản về mã nguồn, bản phái sinh, phân phối lại và đóng góp." } },
  "classroom-trial:fsf-free-software": { evidence: { en: "Free software can be sold, but the profile does not itself create a 30-day trial model.", vi: "Phần mềm tự do có thể được bán, nhưng profile không tự tạo mô hình dùng thử 30 ngày." }, unresolved: { en: "Trial, feature-unlock, support and classroom terms remain open.", vi: "Điều khoản dùng thử, mở tính năng, hỗ trợ và lớp học vẫn chưa xác định." } },
  "classroom-trial:osi-open-source": { evidence: { en: "Open source can be commercial, but the profile does not itself create the requested trial model.", vi: "Mã nguồn mở có thể mang tính thương mại, nhưng profile không tự tạo mô hình dùng thử đã yêu cầu." }, unresolved: { en: "Trial, feature-unlock, support and classroom terms remain open.", vi: "Điều khoản dùng thử, mở tính năng, hỗ trợ và lớp học vẫn chưa xác định." } },
  "classroom-trial:shareware-trial": { evidence: { en: "The trial-then-payment pattern directly matches the evaluation need.", vi: "Mô hình dùng thử rồi thanh toán khớp trực tiếp nhu cầu đánh giá." }, unresolved: { en: "Confirm classroom and device-count terms.", vi: "Xác nhận điều khoản lớp học và số thiết bị." } },
  "classroom-trial:proprietary-commercial": { evidence: { en: "Paid proprietary use may fit deployment, but the trial and user count need confirmation.", vi: "Sử dụng độc quyền có trả phí có thể phù hợp khi triển khai, nhưng cần xác nhận thời gian thử và số người dùng." }, unresolved: { en: "Confirm the 30-day trial and classroom device count.", vi: "Xác nhận dùng thử 30 ngày và số thiết bị lớp học." } },
  "payroll-deployment:fsf-free-software": { evidence: { en: "Free software can have commercial support, but the software licence alone does not supply that contract.", vi: "Phần mềm tự do có thể có hỗ trợ thương mại, nhưng riêng giấy phép phần mềm không tạo ra hợp đồng hỗ trợ." }, unresolved: { en: "Support accountability and deployment responsibilities need a contract.", vi: "Trách nhiệm hỗ trợ và triển khai cần được xác định trong hợp đồng." } },
  "payroll-deployment:osi-open-source": { evidence: { en: "Open source can have commercial support, but the approved licence alone does not supply that contract.", vi: "Mã nguồn mở có thể có hỗ trợ thương mại, nhưng riêng giấy phép được công nhận không tạo ra hợp đồng hỗ trợ." }, unresolved: { en: "Support accountability and deployment responsibilities need a contract.", vi: "Trách nhiệm hỗ trợ và triển khai cần được xác định trong hợp đồng." } },
  "payroll-deployment:shareware-trial": { evidence: { en: "Shareware may support evaluation but does not establish 80-user production rights.", vi: "Shareware có thể hỗ trợ đánh giá nhưng không xác lập quyền triển khai thực tế cho 80 người." }, unresolved: { en: "Production users, continuing use and accountable support need terms.", vi: "Số người dùng thực tế, sử dụng tiếp và hỗ trợ có trách nhiệm cần điều khoản." } },
  "payroll-deployment:proprietary-commercial": { evidence: { en: "A paid multi-user contract directly matches the declared deployment and support needs.", vi: "Hợp đồng nhiều người dùng có trả phí khớp trực tiếp nhu cầu triển khai và hỗ trợ đã nêu." }, unresolved: { en: "Verify exact users, devices, support and data obligations.", vi: "Xác minh chính xác người dùng, thiết bị, hỗ trợ và nghĩa vụ dữ liệu." } },
};

const AI_APP_COPY: Readonly<Record<AiUseCase, Readonly<{ title: LocalText; input: LocalText; task: LocalText; output: LocalText; oversight: LocalText }>>> = {
  "medical-triage": { title: { en: "Medical image triage", vi: "Phân loại ưu tiên ảnh y tế" }, input: { en: "Medical images and reviewed training examples", vi: "Ảnh y tế và mẫu huấn luyện đã được rà soát" }, task: { en: "Detect patterns and prioritise images for review", vi: "Phát hiện mẫu và ưu tiên ảnh để xem xét" }, output: { en: "Priority flag with confidence and reason code", vi: "Cờ ưu tiên kèm độ tin cậy và mã lý do" }, oversight: { en: "A clinician reviews the image and decides care", vi: "Bác sĩ xem lại ảnh và quyết định chăm sóc" } },
  "adaptive-learning": { title: { en: "Adaptive learning", vi: "Học tập thích ứng" }, input: { en: "Learner responses, topic history and declared access needs", vi: "Câu trả lời, lịch sử chủ đề và nhu cầu tiếp cận của học sinh" }, task: { en: "Estimate learning need and select the next practice", vi: "Ước lượng nhu cầu học và chọn bài luyện tiếp theo" }, output: { en: "Recommended task and feedback sequence", vi: "Bài luyện và chuỗi phản hồi được đề xuất" }, oversight: { en: "A teacher reviews progress and intervenes", vi: "Giáo viên xem tiến độ và can thiệp" } },
  "traffic-routing": { title: { en: "Traffic routing", vi: "Điều phối tuyến giao thông" }, input: { en: "Travel times, capacity, incidents and route constraints", vi: "Thời gian đi, sức chứa, sự cố và ràng buộc tuyến" }, task: { en: "Compare routes against the declared transport objective", vi: "So sánh tuyến theo mục tiêu vận tải đã nêu" }, output: { en: "Route or timetable adjustment", vi: "Điều chỉnh tuyến hoặc lịch chạy" }, oversight: { en: "An operator monitors safety, equity and network effects", vi: "Điều hành viên giám sát an toàn, công bằng và tác động mạng lưới" } },
};

const DIMENSION_COPY: Readonly<Record<AiDimension, LocalText>> = {
  social: { en: "Social", vi: "Xã hội" }, economic: { en: "Economic", vi: "Kinh tế" }, environmental: { en: "Environmental", vi: "Môi trường" },
};

const AI_IMPACT_COPY: Readonly<Record<`${AiUseCase}:${AiDimension}`, Readonly<{
  stakeholders: LocalText; benefit: LocalText; risk: LocalText; horizon: LocalText; conditions: LocalText; evidence: LocalText;
}>>> = {
  "medical-triage:social": { stakeholders: { en: "Patients and clinicians", vi: "Bệnh nhân và bác sĩ" }, benefit: { en: "Pattern flags can prioritise a case for earlier clinician review.", vi: "Cờ mẫu có thể ưu tiên ca bệnh để bác sĩ xem sớm hơn." }, risk: { en: "Biased or incorrect output with weak oversight can delay or misdirect care and affect privacy.", vi: "Output thiên lệch hoặc sai cùng giám sát yếu có thể trì hoãn, định hướng sai chăm sóc và ảnh hưởng riêng tư." }, horizon: { en: "Immediate and medium term", vi: "Tức thời và trung hạn" }, conditions: { en: "Reviewed data, clinician oversight and privacy controls", vi: "Dữ liệu được rà soát, giám sát của bác sĩ và kiểm soát riêng tư" }, evidence: { en: "Triage support changes review order; it does not replace clinical judgement.", vi: "Hỗ trợ phân loại thay đổi thứ tự xem; không thay thế phán đoán lâm sàng." } },
  "medical-triage:economic": { stakeholders: { en: "Provider, patients and clinical workforce", vi: "Đơn vị y tế, bệnh nhân và nhân lực lâm sàng" }, benefit: { en: "Prioritisation can use limited specialist review time more efficiently.", vi: "Ưu tiên có thể dùng thời gian chuyên gia hạn chế hiệu quả hơn." }, risk: { en: "Acquisition, validation, training, monitoring and quality assurance add cost.", vi: "Mua sắm, thẩm định, đào tạo, giám sát và bảo đảm chất lượng làm tăng chi phí." }, horizon: { en: "Medium term", vi: "Trung hạn" }, conditions: { en: "Workflow integration, validated performance and staff training", vi: "Tích hợp quy trình, hiệu năng đã thẩm định và đào tạo nhân viên" }, evidence: { en: "Time savings depend on safe integration and must be compared with lifecycle cost.", vi: "Tiết kiệm thời gian phụ thuộc tích hợp an toàn và phải so với chi phí vòng đời." } },
  "medical-triage:environmental": { stakeholders: { en: "Provider, patients and the environment", vi: "Đơn vị y tế, bệnh nhân và môi trường" }, benefit: { en: "Fewer repeat journeys may reduce resources when workflow changes actually replace travel.", vi: "Ít chuyến đi lặp lại có thể giảm tài nguyên khi thay đổi quy trình thực sự thay thế việc di chuyển." }, risk: { en: "Model computation, devices and replacement use energy and materials.", vi: "Tính toán mô hình, thiết bị và thay thế tiêu thụ năng lượng và vật liệu." }, horizon: { en: "Conditional medium term", vi: "Trung hạn có điều kiện" }, conditions: { en: "Actual travel substitution, efficient compute and device lifecycle management", vi: "Thực sự thay thế di chuyển, tính toán hiệu quả và quản lý vòng đời thiết bị" }, evidence: { en: "The direction depends on net resource change, not on the AI label.", vi: "Chiều tác động phụ thuộc thay đổi tài nguyên ròng, không phụ thuộc nhãn AI." } },
  "adaptive-learning:social": { stakeholders: { en: "Learners, teachers and families", vi: "Học sinh, giáo viên và gia đình" }, benefit: { en: "Recommendations can adjust pace and offer timely practice.", vi: "Đề xuất có thể điều chỉnh nhịp độ và cung cấp bài luyện đúng lúc." }, risk: { en: "Surveillance, bias or unequal device and network access can disadvantage learners.", vi: "Giám sát, thiên lệch hoặc tiếp cận thiết bị/mạng không đều có thể gây bất lợi." }, horizon: { en: "Immediate and medium term", vi: "Tức thời và trung hạn" }, conditions: { en: "Teacher oversight, accessible alternatives and data minimisation", vi: "Giám sát của giáo viên, lựa chọn tiếp cận được và tối thiểu hóa dữ liệu" }, evidence: { en: "Personalisation benefits depend on fair access and reviewed recommendations.", vi: "Lợi ích cá nhân hóa phụ thuộc tiếp cận công bằng và đề xuất được xem xét." } },
  "adaptive-learning:economic": { stakeholders: { en: "School, teachers and families", vi: "Nhà trường, giáo viên và gia đình" }, benefit: { en: "Automated feedback may free some teacher time and scale practice.", vi: "Phản hồi tự động có thể giải phóng một phần thời gian giáo viên và mở rộng bài luyện." }, risk: { en: "Subscriptions, training, devices and support add cost and change work roles.", vi: "Thuê bao, đào tạo, thiết bị và hỗ trợ tăng chi phí và làm thay đổi vai trò công việc." }, horizon: { en: "Medium term", vi: "Trung hạn" }, conditions: { en: "Teacher time is reallocated, total cost monitored and staff supported", vi: "Thời gian giáo viên được phân bổ lại, tổng chi phí được theo dõi và nhân viên được hỗ trợ" }, evidence: { en: "Role change is context-dependent and does not prove teaching jobs disappear.", vi: "Thay đổi vai trò phụ thuộc bối cảnh và không chứng minh việc làm giáo viên biến mất." } },
  "adaptive-learning:environmental": { stakeholders: { en: "School, learners and the environment", vi: "Nhà trường, học sinh và môi trường" }, benefit: { en: "Digital distribution may reduce some paper and travel when it replaces them.", vi: "Phân phối số có thể giảm giấy và di chuyển khi thực sự thay thế chúng." }, risk: { en: "Devices, networking, computation and e-waste use energy and materials.", vi: "Thiết bị, mạng, tính toán và rác điện tử tiêu thụ năng lượng và vật liệu." }, horizon: { en: "Conditional medium term", vi: "Trung hạn có điều kiện" }, conditions: { en: "Real paper/travel substitution, device reuse and efficient hosting", vi: "Thay thế thực sự giấy/di chuyển, tái sử dụng thiết bị và hosting hiệu quả" }, evidence: { en: "The net effect requires both avoided and added resource use.", vi: "Tác động ròng cần tính cả tài nguyên tránh dùng và tài nguyên phát sinh." } },
  "traffic-routing:social": { stakeholders: { en: "Passengers, drivers and neighbourhoods", vi: "Hành khách, tài xế và khu dân cư" }, benefit: { en: "Current data can reduce waiting and improve network coordination.", vi: "Dữ liệu hiện thời có thể giảm chờ đợi và cải thiện phối hợp mạng lưới." }, risk: { en: "Poor data, outages or narrow objectives can redirect congestion or exclude some users.", vi: "Dữ liệu kém, gián đoạn hoặc mục tiêu hẹp có thể chuyển ùn tắc hoặc loại trừ một số người." }, horizon: { en: "Immediate", vi: "Tức thời" }, conditions: { en: "Reliable data, safety constraints and equity monitoring", vi: "Dữ liệu tin cậy, ràng buộc an toàn và giám sát công bằng" }, evidence: { en: "A faster average route can still shift cost to a particular community.", vi: "Tuyến trung bình nhanh hơn vẫn có thể chuyển chi phí sang một cộng đồng cụ thể." } },
  "traffic-routing:economic": { stakeholders: { en: "Operator, workers and customers", vi: "Đơn vị vận hành, người lao động và khách hàng" }, benefit: { en: "Better fleet use may reduce idle time and operating waste.", vi: "Sử dụng đội xe tốt hơn có thể giảm thời gian chờ và lãng phí vận hành." }, risk: { en: "Sensors, integration, maintenance and retraining require investment.", vi: "Cảm biến, tích hợp, bảo trì và đào tạo lại cần đầu tư." }, horizon: { en: "Short and medium term", vi: "Ngắn và trung hạn" }, conditions: { en: "System reliability, maintenance capacity and worker retraining", vi: "Độ tin cậy hệ thống, năng lực bảo trì và đào tạo lại" }, evidence: { en: "Operating benefit must be compared with implementation and transition cost.", vi: "Lợi ích vận hành phải được so với chi phí triển khai và chuyển đổi." } },
  "traffic-routing:environmental": { stakeholders: { en: "Residents, transport users and the environment", vi: "Cư dân, người dùng giao thông và môi trường" }, benefit: { en: "Reduced idling or distance can lower energy use under the fixture assumptions.", vi: "Giảm thời gian chờ hoặc quãng đường có thể giảm năng lượng theo giả định tình huống." }, risk: { en: "Induced demand, rebound and sensor/compute infrastructure can offset savings.", vi: "Nhu cầu phát sinh, hiệu ứng bật lại và hạ tầng cảm biến/tính toán có thể bù trừ phần tiết kiệm." }, horizon: { en: "Conditional medium and long term", vi: "Trung và dài hạn có điều kiện" }, conditions: { en: "Measured net reduction, no offsetting demand and efficient infrastructure", vi: "Giảm ròng được đo, không có nhu cầu bù trừ và hạ tầng hiệu quả" }, evidence: { en: "Environmental benefit is conditional on net system resource use.", vi: "Lợi ích môi trường phụ thuộc có điều kiện vào tài nguyên ròng của toàn hệ thống." } },
};

function ConsequenceChain({ locale, nodes, activeIds, ticket }: { readonly locale: Paper1Locale; readonly nodes: readonly ChainNode[]; readonly activeIds: readonly string[]; readonly ticket: string }) {
  return <div className={styles.consequenceChain} role="img" aria-label={copy(locale, `Consequence chain; current evidence ${ticket}`, `Chuỗi hệ quả; bằng chứng hiện tại ${ticket}`)}>
    {nodes.map((node, index) => <div className={styles.chainWrap} key={node.id}>
      <div className={styles.chainNode} data-active={activeIds.includes(node.id) || undefined}>
        <small>{node.eyebrow}</small><strong>{node.value}</strong>{activeIds.includes(node.id) ? <b aria-hidden="true">{ticket}</b> : null}
      </div>{index < nodes.length - 1 ? <i aria-hidden="true">→</i> : null}
    </div>)}
  </div>;
}

type JourneyProps = Readonly<{
  locale: Paper1Locale; visualId: string; title: string; intro: string; controls: ReactNode;
  prediction: Prediction; scenes: readonly Scene[]; stateKey: string; onReset: () => void;
}>;

function Journey(props: JourneyProps) {
  const resetTargetRef = useRef<HTMLHeadingElement>(null);
  const resetToStart = () => {
    props.onReset();
    requestAnimationFrame(() => resetTargetRef.current?.focus());
  };
  return <section className={styles.lab} data-paper1-visual={props.visualId} aria-labelledby={`${props.visualId}-title`}>
    <header className={styles.header}><span>CHAPTER 7 · CONSEQUENCE LEDGER · {props.visualId}</span><h3 ref={resetTargetRef} tabIndex={-1} id={`${props.visualId}-title`}>{props.title}</h3><p>{props.intro}</p></header>
    <div className={styles.controls}>{props.controls}<div className={styles.controlNote}><strong>{copy(props.locale, "Inspect the declared case", "Quan sát tình huống đã khai báo")}</strong><span>{copy(props.locale, "Changing a selector clears the prediction and returns to evidence 01.", "Đổi lựa chọn sẽ xóa dự đoán và trở về bằng chứng 01.")}</span></div></div>
    <JourneySession key={props.stateKey} {...props} onReset={resetToStart} />
  </section>;
}

function JourneySession({ locale, prediction, scenes, onReset }: JourneyProps) {
  const [step, setStep] = useState(0);
  const [draftChoice, setDraftChoice] = useState<string>();
  const [draftReason, setDraftReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const radioName = useId();
  const responseId = useId();
  const safeStep = Math.min(step, scenes.length - 1);
  const current = scenes[safeStep];
  const finished = safeStep === scenes.length - 1;
  const selected = prediction.choices.find((entry) => entry.id === draftChoice);
  const expected = prediction.choices.find((entry) => entry.id === prediction.expectedChoiceId);
  const ready = Boolean(draftChoice && draftReason.trim().length >= 12);
  const submitPrediction = () => { if (!ready) return; setStep(0); setSubmitted(true); };
  const reset = () => { onReset(); setStep(0); setDraftChoice(undefined); setDraftReason(""); setSubmitted(false); };
  return <>
    <fieldset className={styles.prediction}><legend>{copy(locale, "Predict and justify before evidence is revealed", "Dự đoán và giải thích trước khi mở bằng chứng")}</legend><p>{prediction.prompt}</p><div className={styles.predictionChoices}>{prediction.choices.map((entry) => <label key={entry.id}><input type="radio" name={radioName} checked={draftChoice === entry.id} onChange={() => { setDraftChoice(entry.id); setSubmitted(false); setStep(0); }} /><span>{entry.label}</span></label>)}</div><label className={styles.responseLabel} htmlFor={responseId}><strong>{prediction.responsePrompt}</strong><textarea id={responseId} rows={3} value={draftReason} onChange={(event) => { setDraftReason(event.target.value); setSubmitted(false); setStep(0); }} placeholder={copy(locale, "Write a short because-clause using the scenario facts…", "Viết một mệnh đề vì sao ngắn dựa trên dữ kiện tình huống…")} /></label><div className={styles.submitRow}><Button disabled={!ready} onClick={submitPrediction}>{copy(locale, "Record prediction", "Ghi dự đoán")}</Button><small aria-live="polite">{submitted ? copy(locale, "Prediction recorded. Next reveals one evidence change at a time.", "Đã ghi dự đoán. Tiếp theo sẽ mở từng thay đổi bằng chứng.") : ready ? copy(locale, "Ready to record. Your reason is kept for rubric self-review.", "Sẵn sàng ghi. Lý do của bạn được giữ để tự kiểm theo rubric.") : copy(locale, "Choose a prediction and write at least 12 characters.", "Chọn một dự đoán và viết ít nhất 12 ký tự.")}</small></div></fieldset>
    {submitted ? <div className={styles.stage} data-scene-id={current.sceneId}>
      <div className={styles.meter} style={{ "--step-count": scenes.length } as CSSProperties} role="img" aria-label={copy(locale, `Evidence ${safeStep + 1} of ${scenes.length}`, `Bằng chứng ${safeStep + 1} trên ${scenes.length}`)}>{scenes.map((_, index) => <span key={index} data-current={index === safeStep || undefined} data-complete={index < safeStep || undefined} />)}</div>
      <div className={styles.instrument}><div className={styles.canvasWrap} tabIndex={0} aria-label={copy(locale, "Interactive consequence model", "Mô hình hệ quả tương tác")}>{current.graphic}</div><aside className={styles.receipt} aria-label={copy(locale, "Consequence ledger", "Sổ hệ quả")}><strong>{copy(locale, "CONSEQUENCE LEDGER", "SỔ HỆ QUẢ")}</strong><dl>{current.receipt.map((entry, index) => <div key={`${entry.label}-${index}`} data-current={entry.current || undefined} data-evidence-ticket={entry.evidenceTicket}><dt><span aria-label={entry.evidenceTicket ? copy(locale, `Evidence ${entry.evidenceTicket}`, `Bằng chứng ${entry.evidenceTicket}`) : copy(locale, `Ledger row ${index + 1}`, `Dòng sổ ${index + 1}`)}>{entry.evidenceTicket ?? String(index + 1).padStart(2, "0")}</span>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></aside></div>
      <div className={styles.explanation} aria-live="polite" aria-atomic="true"><span>{copy(locale, `EVIDENCE ${String(safeStep + 1).padStart(2, "0")}`, `BẰNG CHỨNG ${String(safeStep + 1).padStart(2, "0")}`)}</span><h4>{current.title}</h4><p>{current.explanation}</p></div>
      <div className={styles.textEquivalent}><strong>{copy(locale, "Cumulative text equivalent", "Mô tả chữ tích lũy")}</strong><p>{copy(locale, "Every revealed fact, relationship and condition remains available without relying on colour, position or motion.", "Mọi dữ kiện, quan hệ và điều kiện đã mở vẫn đọc được mà không phụ thuộc màu sắc, vị trí hoặc chuyển động.")}</p><ol>{scenes.slice(0, safeStep + 1).map((scene, sceneIndex) => <li key={scene.sceneId} aria-current={sceneIndex === safeStep ? "step" : undefined}><h5>{copy(locale, `Evidence ${sceneIndex + 1}`, `Bằng chứng ${sceneIndex + 1}`)} · {scene.title}</h5><p>{scene.explanation}</p><dl>{scene.receipt.map((entry, index) => <div key={`${entry.label}-${index}`}><dt>{entry.evidenceTicket ? `${copy(locale, "Evidence", "Bằng chứng")} ${entry.evidenceTicket} · ` : ""}{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></li>)}</ol></div>
      {finished ? <aside className={styles.comparison} data-match={draftChoice === prediction.expectedChoiceId || undefined} aria-live="polite"><strong>{draftChoice === prediction.expectedChoiceId ? copy(locale, "Prediction matched the authored fixture facts", "Dự đoán khớp dữ kiện của tình huống đã viết") : copy(locale, "Review the prediction against the authored fixture facts", "Xem lại dự đoán theo dữ kiện của tình huống đã viết")}</strong><p>{copy(locale, "This comparison checks the finite evidence relation. It does not automatically grade your ethical, legal or impact judgement.", "So sánh này chỉ kiểm tra quan hệ bằng chứng hữu hạn. Nó không tự chấm kết luận đạo đức, pháp lý hoặc tác động của bạn.")}</p><dl><div><dt>{copy(locale, "You predicted", "Bạn dự đoán")}</dt><dd>{selected?.label}</dd></div><div><dt>{copy(locale, "Fixture evidence supports", "Bằng chứng tình huống hỗ trợ")}</dt><dd>{expected?.label}</dd></div></dl><div className={styles.rubric}><strong>{copy(locale, "Rubric self-review", "Tự kiểm theo rubric")}</strong><p><b>{copy(locale, "Your reason:", "Lý do của bạn:")}</b> {draftReason}</p><ul>{prediction.rubric.map((point) => <li key={point}>{point}</li>)}</ul></div></aside> : null}
      <nav className={styles.navigation} aria-label={copy(locale, "Evidence controls", "Điều khiển bằng chứng")}><Button variant="secondary" disabled={safeStep === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={17} aria-hidden="true" />{copy(locale, "Back", "Quay lại")}</Button><Button variant="quiet" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{copy(locale, "Reset", "Đặt lại")}</Button><Button disabled={finished} onClick={() => setStep((value) => Math.min(scenes.length - 1, value + 1))}>{copy(locale, "Next", "Tiếp theo")}<ArrowRight size={17} aria-hidden="true" /></Button></nav>
    </div> : <div className={styles.lockedStage} role="status" aria-live="polite"><strong>{copy(locale, "Prediction gate", "Cổng dự đoán")}</strong><p>{copy(locale, "The diagram, consequence ledger and authored comparison stay hidden until you record a prediction and reason.", "Sơ đồ, sổ hệ quả và so sánh đã viết được giữ kín tới khi bạn ghi dự đoán và lý do.")}</p></div>}
  </>;
}

function EthicsLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { scenario: "unsafe-release" as EthicsScenario, action: "report-and-delay" as EthicsAction };
  const [scenario, setScenario] = useState(defaults.scenario);
  const [action, setAction] = useState(defaults.action);
  const facts = ETHICS_FIXTURES[scenario][action];
  const scenarioCopy = ETHICS_SCENARIO_COPY[scenario];
  const actionCopy = ETHICS_ACTION_COPY[action];
  const legalCopy = ETHICS_LEGAL_COPY[action];
  const frames = ethicsFrames(scenario, action);
  const legalStatusBoundaryModel = facts.legalStatusBoundary;
  const legalEvidenceNeededModel = facts.legalEvidenceNeeded;
  const professionalEthicsEvidenceModel = facts.professionalEthicsEvidence;
  const professionalBodyContributionModel = facts.professionalBodyContribution;
  const relationLabel = facts.professionalEthicsRelation === "supports-duty" ? copy(locale, "Supports the named professional duties", "Hỗ trợ các nghĩa vụ nghề nghiệp đã nêu") : copy(locale, "Conflicts with the named professional duties", "Xung đột với các nghĩa vụ nghề nghiệp đã nêu");
  const scenes = frames.map((frame, index): Scene => ({
    sceneId: `P1-L41-${scenario}-${action}-${frame.id}`,
    title: [copy(locale, "Read the role, facts and stakeholders", "Đọc vai trò, dữ kiện và các bên liên quan"), copy(locale, "Apply the action and mark the legal boundary", "Áp dụng hành động và đánh dấu ranh giới pháp lý"), copy(locale, "Trace professional duties and stakeholder effects", "Theo dõi nghĩa vụ nghề nghiệp và tác động tới bên liên quan"), copy(locale, "Build a distinct professional judgement", "Xây dựng nhận định nghề nghiệp độc lập")][index],
    explanation: [copy(locale, `${local(locale, scenarioCopy.role)} faces three fixed facts. No professional or legal conclusion is inferred yet.`, `${local(locale, scenarioCopy.role)} đối mặt với ba dữ kiện cố định. Chưa suy ra kết luận nghề nghiệp hoặc pháp lý.`), copy(locale, `${local(locale, actionCopy.change)} ${local(locale, legalCopy.boundary)} ${local(locale, legalCopy.evidence)}`, `${local(locale, actionCopy.change)} ${local(locale, legalCopy.boundary)} ${local(locale, legalCopy.evidence)}`), copy(locale, `${localList(locale, actionCopy.duties)}. Effects: ${localList(locale, actionCopy.effects)}`, `${localList(locale, actionCopy.duties)}. Tác động: ${localList(locale, actionCopy.effects)}`), copy(locale, `${local(locale, actionCopy.argument)} Professional ethics and legal status are separate judgements. ${local(locale, actionCopy.condition)}`, `${local(locale, actionCopy.argument)} Đạo đức nghề nghiệp và trạng thái pháp lý là hai nhận định riêng. ${local(locale, actionCopy.condition)}`)][index],
    graphic: <ConsequenceChain locale={locale} activeIds={frame.activeIds} ticket={frame.ticket} nodes={[
      { id: "scenario", eyebrow: copy(locale, "SCENARIO", "TÌNH HUỐNG"), value: local(locale, scenarioCopy.title) },
      { id: "action", eyebrow: copy(locale, "ACTION", "HÀNH ĐỘNG"), value: index >= 1 ? local(locale, actionCopy.label) : copy(locale, "Selected, not applied", "Đã chọn, chưa áp dụng") },
      { id: "legal-boundary", eyebrow: copy(locale, "LEGAL STATUS BOUNDARY / EVIDENCE NEEDED", "RANH GIỚI TRẠNG THÁI / BẰNG CHỨNG PHÁP LÝ CẦN CÓ"), value: index >= 1 && legalStatusBoundaryModel && legalEvidenceNeededModel ? `${local(locale, legalCopy.boundary)} ${local(locale, legalCopy.evidence)}` : copy(locale, "Not revealed", "Chưa mở") },
      { id: "principle", eyebrow: copy(locale, "PROFESSIONAL DUTY", "NGHĨA VỤ NGHỀ NGHIỆP"), value: index >= 2 ? localList(locale, actionCopy.duties) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "stakeholder", eyebrow: copy(locale, "STAKEHOLDER EFFECT", "TÁC ĐỘNG TỚI BÊN LIÊN QUAN"), value: index >= 2 ? localList(locale, actionCopy.effects) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "professional-evidence", eyebrow: copy(locale, "PROFESSIONAL ETHICS EVIDENCE", "BẰNG CHỨNG ĐẠO ĐỨC NGHỀ NGHIỆP"), value: index === 3 && professionalEthicsEvidenceModel ? local(locale, actionCopy.evidence) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "conclusion", eyebrow: copy(locale, "QUALIFIED ARGUMENT", "LẬP LUẬN CÓ ĐIỀU KIỆN"), value: index === 3 ? relationLabel : copy(locale, "Not revealed", "Chưa mở") },
    ]} />,
    receipt: ticketReceipt(frame.ticket, [
      { label: copy(locale, "Role", "Vai trò"), value: local(locale, scenarioCopy.role), current: index === 0 },
      { label: copy(locale, "Scenario facts", "Dữ kiện tình huống"), value: localList(locale, scenarioCopy.facts), current: index === 0 },
      { label: copy(locale, "Stakeholders", "Các bên liên quan"), value: localList(locale, scenarioCopy.stakeholders), current: index === 0 },
      { label: copy(locale, "Applied action", "Hành động đã áp dụng"), value: index >= 1 ? local(locale, actionCopy.change) : "—", current: index === 1 },
      { label: copy(locale, "Legal status boundary", "Ranh giới trạng thái pháp lý"), value: index >= 1 && legalStatusBoundaryModel ? local(locale, legalCopy.boundary) : "—", current: index === 1 },
      { label: copy(locale, "Legal evidence needed", "Bằng chứng pháp lý cần có"), value: index >= 1 && legalEvidenceNeededModel ? local(locale, legalCopy.evidence) : "—", current: index === 1 },
      { label: copy(locale, "Professional duties", "Nghĩa vụ nghề nghiệp"), value: index >= 2 ? localList(locale, actionCopy.duties) : "—", current: index === 2 },
      { label: copy(locale, "Stakeholder effects", "Tác động tới bên liên quan"), value: index >= 2 ? localList(locale, actionCopy.effects) : "—", current: index === 2 },
      { label: copy(locale, "Professional body contribution", "Đóng góp của tổ chức nghề nghiệp"), value: index >= 2 && professionalBodyContributionModel ? copy(locale, "BCS/IEEE codes, guidance, development, community and accountability; membership does not guarantee conduct", "Quy tắc, hướng dẫn, phát triển, cộng đồng và trách nhiệm của BCS/IEEE; tư cách thành viên không bảo đảm hành vi") : "—", current: index === 2 },
      { label: copy(locale, "Professional ethics relation", "Quan hệ đạo đức nghề nghiệp"), value: index === 3 ? relationLabel : "—", current: index === 3 },
      { label: copy(locale, "Professional ethics evidence", "Bằng chứng đạo đức nghề nghiệp"), value: index === 3 && professionalEthicsEvidenceModel ? local(locale, actionCopy.evidence) : "—", current: index === 3 },
      { label: copy(locale, "Condition", "Điều kiện"), value: index === 3 ? local(locale, actionCopy.condition) : "—", current: index === 3 },
    ]),
  }));
  const changeScenario = (next: EthicsScenario) => { setScenario(next); setAction(ETHICS_ACTIONS[next][0]); };
  return <Journey locale={locale} visualId="VIS-P1-L41" title={copy(locale, "Professional decision and stakeholder ledger", "Sổ quyết định nghề nghiệp và bên liên quan")} intro={copy(locale, "Use scenario facts, professional duties and stakeholder effects to build a qualified argument. Legal status remains a separate, context-specific question. BCS/IEEE guidance supports accountability; membership never guarantees conduct.", "Dùng dữ kiện tình huống, nghĩa vụ nghề nghiệp và tác động tới bên liên quan để lập luận có điều kiện. Trạng thái pháp lý vẫn là câu hỏi riêng, phụ thuộc bối cảnh. Hướng dẫn BCS/IEEE hỗ trợ trách nhiệm; tư cách thành viên không bảo đảm hành vi.")} stateKey={`${scenario}-${action}`} onReset={() => { setScenario(defaults.scenario); setAction(defaults.action); }} controls={<><Select id="p1-l41-scenario" label={copy(locale, "Professional scenario", "Tình huống nghề nghiệp")} value={scenario} onChange={(event) => changeScenario(event.target.value as EthicsScenario)}>{ETHICS_SCENARIOS.map((id) => <option key={id} value={id}>{local(locale, ETHICS_SCENARIO_COPY[id].title)}</option>)}</Select><Select id="p1-l41-action" label={copy(locale, "Proposed action", "Hành động đề xuất")} value={action} onChange={(event) => setAction(event.target.value as EthicsAction)}>{ETHICS_ACTIONS[scenario].map((id) => <option key={id} value={id}>{local(locale, ETHICS_ACTION_COPY[id].label)}</option>)}</Select><div className={styles.conditionCard}><strong>{copy(locale, "Known facts", "Dữ kiện đã biết")}</strong><span>{localList(locale, scenarioCopy.facts)}</span></div></>} prediction={{ prompt: copy(locale, "Against the named professional duties in this authored scenario, what relation will the evidence support?", "Theo các nghĩa vụ nghề nghiệp trong tình huống đã viết, bằng chứng sẽ hỗ trợ quan hệ nào?"), responsePrompt: copy(locale, "Give a because-clause naming one stakeholder and likely effect.", "Viết một mệnh đề vì sao, nêu một bên liên quan và tác động có thể xảy ra."), choices: [{ id: "supports-duty", label: copy(locale, "Supports the named duties", "Hỗ trợ các nghĩa vụ đã nêu") }, { id: "conflicts-with-duty", label: copy(locale, "Conflicts with the named duties", "Xung đột với các nghĩa vụ đã nêu") }], expectedChoiceId: facts.professionalEthicsRelation, rubric: [copy(locale, "Name the action taken.", "Nêu hành động được thực hiện."), copy(locale, "Link one professional duty or professional-body purpose.", "Liên kết một nghĩa vụ nghề nghiệp hoặc mục đích của tổ chức nghề nghiệp."), copy(locale, "Explain one stakeholder effect from the facts.", "Giải thích một tác động tới bên liên quan từ dữ kiện."), copy(locale, "Keep the professional judgement separate from any context-specific legal review.", "Giữ nhận định nghề nghiệp tách biệt với việc xem xét pháp lý theo bối cảnh.")] }} scenes={scenes} />;
}

function LicenceComparison({ locale, scenario, profile }: { readonly locale: Paper1Locale; readonly scenario: LicenceScenario; readonly profile: LicenceProfile }) {
  const scenarioCopy = LICENCE_SCENARIO_COPY[scenario];
  const profileCopy = LICENCE_PROFILE_COPY[profile];
  return <div className={styles.localScroll} tabIndex={0} aria-label={copy(locale, "Scenario needs and reference-profile permissions", "Nhu cầu tình huống và quyền của profile tham chiếu")}><table><caption>{copy(locale, "Compare needs with declared permissions and conditions", "So sánh nhu cầu với quyền và điều kiện đã nêu")}</caption><thead><tr><th>{copy(locale, "Scenario needs", "Nhu cầu tình huống")}</th><th>{copy(locale, "Profile permissions", "Quyền của profile")}</th><th>{copy(locale, "Profile conditions", "Điều kiện của profile")}</th></tr></thead><tbody><tr><td>{localList(locale, scenarioCopy.needs)}</td><td>{localList(locale, profileCopy.permissions)}</td><td>{localList(locale, profileCopy.conditions)}</td></tr></tbody></table></div>;
}

function LicenceLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { scenario: "community-accessibility" as LicenceScenario, profile: "fsf-free-software" as LicenceProfile };
  const [scenario, setScenario] = useState(defaults.scenario);
  const [profile, setProfile] = useState(defaults.profile);
  const facts = licenceFacts(scenario, profile);
  const scenarioCopy = LICENCE_SCENARIO_COPY[scenario];
  const profileCopy = LICENCE_PROFILE_COPY[profile];
  const assessmentCopy = LICENCE_ASSESSMENT_COPY[`${scenario}:${profile}`];
  const frames = licenceFrames(scenario, profile);
  const fitLabel = local(locale, FIT_COPY[facts.fitClass]);
  const scenes = frames.map((frame, index): Scene => ({
    sceneId: `P1-L42-${scenario}-${profile}-${frame.id}`,
    title: [copy(locale, "Fix the rightsholder and usage needs", "Cố định chủ thể quyền và nhu cầu sử dụng"), copy(locale, "Read the reference profile", "Đọc profile tham chiếu"), copy(locale, "Compare permissions with needs", "So sánh quyền với nhu cầu"), copy(locale, "Justify fit with terms and overlap", "Giải thích độ phù hợp bằng điều khoản và phần giao")][index],
    explanation: [copy(locale, `${local(locale, scenarioCopy.holder)} controls the work. ${local(locale, scenarioCopy.copyright)}`, `${local(locale, scenarioCopy.holder)} kiểm soát tác phẩm. ${local(locale, scenarioCopy.copyright)}`), copy(locale, `${local(locale, profileCopy.title)}: ${localList(locale, profileCopy.permissions)}.`, `${local(locale, profileCopy.title)}: ${localList(locale, profileCopy.permissions)}.`), copy(locale, `${local(locale, assessmentCopy.evidence)} Unresolved: ${local(locale, assessmentCopy.unresolved)}`, `${local(locale, assessmentCopy.evidence)} Chưa xác định: ${local(locale, assessmentCopy.unresolved)}`), copy(locale, `${fitLabel}. ${local(locale, profileCopy.overlap)}`, `${fitLabel}. ${local(locale, profileCopy.overlap)}`)][index],
    graphic: <div className={styles.modelStack}><ConsequenceChain locale={locale} activeIds={frame.activeIds} ticket={frame.ticket} nodes={[
      { id: "needs", eyebrow: copy(locale, "DECLARED NEEDS", "NHU CẦU ĐÃ NÊU"), value: localList(locale, scenarioCopy.needs) },
      { id: "profile", eyebrow: copy(locale, "REFERENCE PROFILE", "PROFILE THAM CHIẾU"), value: index >= 1 ? local(locale, profileCopy.title) : copy(locale, "Selected, not applied", "Đã chọn, chưa áp dụng") },
      { id: "permissions", eyebrow: copy(locale, "PERMISSIONS / CONDITIONS", "QUYỀN / ĐIỀU KIỆN"), value: index >= 2 ? localList(locale, profileCopy.permissions) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "comparison", eyebrow: copy(locale, "EVIDENCE COMPARISON", "SO SÁNH BẰNG CHỨNG"), value: index >= 2 ? local(locale, assessmentCopy.evidence) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "verdict", eyebrow: copy(locale, "QUALIFIED FIT", "ĐỘ PHÙ HỢP CÓ ĐIỀU KIỆN"), value: index === 3 ? fitLabel : copy(locale, "Not revealed", "Chưa mở") },
    ]} />{index >= 2 ? <LicenceComparison locale={locale} scenario={scenario} profile={profile} /> : null}</div>,
    receipt: ticketReceipt(frame.ticket, [
      { label: copy(locale, "Rightsholder", "Chủ thể quyền"), value: local(locale, scenarioCopy.holder), current: index === 0 },
      { label: copy(locale, "Copyright purpose", "Mục đích bản quyền"), value: local(locale, scenarioCopy.copyright), current: index === 0 },
      { label: copy(locale, "Usage needs", "Nhu cầu sử dụng"), value: localList(locale, scenarioCopy.needs), current: index === 0 },
      { label: copy(locale, "Reference profile", "Profile tham chiếu"), value: index >= 1 ? local(locale, profileCopy.title) : "—", current: index === 1 },
      { label: copy(locale, "Permissions", "Quyền"), value: index >= 1 ? localList(locale, profileCopy.permissions) : "—", current: index === 1 },
      { label: copy(locale, "Evidence", "Bằng chứng"), value: index >= 2 ? local(locale, assessmentCopy.evidence) : "—", current: index === 2 },
      { label: copy(locale, "Unresolved terms", "Điều khoản chưa xác định"), value: index >= 2 ? local(locale, assessmentCopy.unresolved) : "—", current: index === 2 },
      { label: copy(locale, "Relative fit", "Độ phù hợp tương đối"), value: index === 3 ? fitLabel : "—", current: index === 3 },
      { label: copy(locale, "Overlap / actual-licence caveat", "Cảnh báo về phần giao / giấy phép thực tế"), value: index === 3 ? local(locale, profileCopy.overlap) : "—", current: index === 3 },
    ]),
  }));
  return <Journey locale={locale} visualId="VIS-P1-L42" title={copy(locale, "Copyright boundary and licence-fit matrix", "Ranh giới bản quyền và ma trận phù hợp giấy phép")} intro={copy(locale, "Compare declared needs with four syllabus reference profiles. Actual permissions come from the specific licence; free/open-source software can be commercial.", "So sánh nhu cầu đã nêu với bốn profile tham chiếu của syllabus. Quyền thực tế đến từ giấy phép cụ thể; phần mềm tự do/mã nguồn mở có thể mang tính thương mại.")} stateKey={`${scenario}-${profile}`} onReset={() => { setScenario(defaults.scenario); setProfile(defaults.profile); }} controls={<><Select id="p1-l42-scenario" label={copy(locale, "Usage scenario", "Tình huống sử dụng")} value={scenario} onChange={(event) => setScenario(event.target.value as LicenceScenario)}>{LICENCE_SCENARIOS.map((id) => <option key={id} value={id}>{local(locale, LICENCE_SCENARIO_COPY[id].title)}</option>)}</Select><Select id="p1-l42-profile" label={copy(locale, "Syllabus reference profile", "Profile tham chiếu syllabus")} value={profile} onChange={(event) => setProfile(event.target.value as LicenceProfile)}>{LICENCE_PROFILES.map((id) => <option key={id} value={id}>{local(locale, LICENCE_PROFILE_COPY[id].title)}</option>)}</Select><div className={styles.conditionCard}><strong>{copy(locale, "Actual licence controls rights", "Giấy phép thực tế quyết định quyền")}</strong><span>{copy(locale, "FSF and OSI are organisations/philosophies, shareware remains copyrighted, and commercial can overlap with free/open source.", "FSF và OSI là tổ chức/triết lý, shareware vẫn có bản quyền, và thương mại có thể giao với phần mềm tự do/mã nguồn mở.")}</span></div></>} prediction={{ prompt: copy(locale, "Against only the displayed needs, how well does this simplified reference profile fit?", "Chỉ xét các nhu cầu đang hiển thị, profile tham chiếu đơn giản này phù hợp đến đâu?"), responsePrompt: copy(locale, "Give a because-clause using two needs, permissions or conditions.", "Viết một mệnh đề vì sao dùng hai nhu cầu, quyền hoặc điều kiện."), choices: (Object.keys(FIT_COPY) as LicenceFit[]).map((id) => ({ id, label: local(locale, FIT_COPY[id]) })), expectedChoiceId: facts.fitClass, rubric: [copy(locale, "State the scenario's relevant needs.", "Nêu các nhu cầu liên quan của tình huống."), copy(locale, "Cite at least two permissions or conditions.", "Dẫn ít nhất hai quyền hoặc điều kiện."), copy(locale, "Explain relative fit; do not issue a universal legal verdict.", "Giải thích độ phù hợp tương đối; không đưa ra kết luận pháp lý phổ quát."), copy(locale, "State that actual rights come from the specific licence and categories can overlap.", "Nêu rằng quyền thực tế đến từ giấy phép cụ thể và các nhóm có thể giao nhau.")] }} scenes={scenes} />;
}

function AiLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { useCase: "medical-triage" as AiUseCase, dimension: "social" as AiDimension };
  const [useCase, setUseCase] = useState(defaults.useCase);
  const [dimension, setDimension] = useState(defaults.dimension);
  const facts = aiFacts(useCase, dimension);
  const appCopy = AI_APP_COPY[useCase];
  const impactCopy = AI_IMPACT_COPY[`${useCase}:${dimension}`];
  const frames = aiFrames(useCase, dimension);
  const scenes = frames.map((frame, index): Scene => ({
    sceneId: `P1-L43-${useCase}-${dimension}-${frame.id}`,
    title: [copy(locale, "Trace the AI application", "Theo dõi ứng dụng AI"), copy(locale, "Select the impact dimension", "Chọn chiều tác động"), copy(locale, "Reveal benefit and risk pathways", "Mở đường lợi ích và rủi ro"), copy(locale, "Write a balanced conditional conclusion", "Viết kết luận cân bằng có điều kiện")][index],
    explanation: [copy(locale, `Input: ${local(locale, appCopy.input)}. Task: ${local(locale, appCopy.task)}. Output/use: ${local(locale, appCopy.output)}; ${local(locale, appCopy.oversight)}.`, `Input: ${local(locale, appCopy.input)}. Nhiệm vụ: ${local(locale, appCopy.task)}. Output/cách dùng: ${local(locale, appCopy.output)}; ${local(locale, appCopy.oversight)}.`), copy(locale, `${local(locale, DIMENSION_COPY[dimension])} focus; stakeholders: ${local(locale, impactCopy.stakeholders)}; horizon: ${local(locale, impactCopy.horizon)}.`, `Trọng tâm ${local(locale, DIMENSION_COPY[dimension])}; bên liên quan: ${local(locale, impactCopy.stakeholders)}; thời gian: ${local(locale, impactCopy.horizon)}.`), copy(locale, `Benefit path: ${local(locale, impactCopy.benefit)} Risk path: ${local(locale, impactCopy.risk)}`, `Đường lợi ích: ${local(locale, impactCopy.benefit)} Đường rủi ro: ${local(locale, impactCopy.risk)}`), copy(locale, `${local(locale, impactCopy.evidence)} Conditions: ${local(locale, impactCopy.conditions)}.`, `${local(locale, impactCopy.evidence)} Điều kiện: ${local(locale, impactCopy.conditions)}.`)][index],
    graphic: <ConsequenceChain locale={locale} activeIds={frame.activeIds} ticket={frame.ticket} nodes={[
      { id: "application", eyebrow: copy(locale, "INPUT → AI TASK → OUTPUT/USE", "INPUT → NHIỆM VỤ AI → OUTPUT/CÁCH DÙNG"), value: `${local(locale, appCopy.input)} → ${local(locale, appCopy.task)} → ${local(locale, appCopy.output)}` },
      { id: "dimension", eyebrow: copy(locale, "IMPACT DIMENSION", "CHIỀU TÁC ĐỘNG"), value: index >= 1 ? local(locale, DIMENSION_COPY[dimension]) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "benefit", eyebrow: copy(locale, "BENEFIT PATH", "ĐƯỜNG LỢI ÍCH"), value: index >= 2 ? local(locale, impactCopy.benefit) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "risk", eyebrow: copy(locale, "RISK / CONDITION PATH", "ĐƯỜNG RỦI RO / ĐIỀU KIỆN"), value: index >= 2 ? local(locale, impactCopy.risk) : copy(locale, "Not revealed", "Chưa mở") },
      { id: "conclusion", eyebrow: copy(locale, "BALANCED CONCLUSION", "KẾT LUẬN CÂN BẰNG"), value: index === 3 ? local(locale, impactCopy.evidence) : copy(locale, "Not revealed", "Chưa mở") },
    ]} />,
    receipt: ticketReceipt(frame.ticket, [
      { label: copy(locale, "Input data", "Dữ liệu đầu vào"), value: local(locale, appCopy.input), current: index === 0 },
      { label: copy(locale, "AI processing", "Xử lý AI"), value: local(locale, appCopy.task), current: index === 0 },
      { label: copy(locale, "Output / use", "Output / cách dùng"), value: local(locale, appCopy.output), current: index === 0 },
      { label: copy(locale, "Oversight", "Giám sát"), value: local(locale, appCopy.oversight), current: index === 0 },
      { label: copy(locale, "Dimension", "Chiều tác động"), value: index >= 1 ? local(locale, DIMENSION_COPY[dimension]) : "—", current: index === 1 },
      { label: copy(locale, "Stakeholders", "Các bên liên quan"), value: index >= 1 ? local(locale, impactCopy.stakeholders) : "—", current: index === 1 },
      { label: copy(locale, "Benefit mechanism", "Cơ chế lợi ích"), value: index >= 2 ? local(locale, impactCopy.benefit) : "—", current: index === 2 },
      { label: copy(locale, "Risk mechanism", "Cơ chế rủi ro"), value: index >= 2 ? local(locale, impactCopy.risk) : "—", current: index === 2 },
      { label: copy(locale, "Time horizon / conditions", "Thời gian / điều kiện"), value: index === 3 ? `${local(locale, impactCopy.horizon)} · ${local(locale, impactCopy.conditions)}` : "—", current: index === 3 },
      { label: copy(locale, "Qualified conclusion", "Kết luận có điều kiện"), value: index === 3 ? local(locale, impactCopy.evidence) : "—", current: index === 3 },
    ]),
  }));
  return <Journey locale={locale} visualId="VIS-P1-L43" title={copy(locale, "AI application and impact map", "Bản đồ ứng dụng và tác động AI")} intro={copy(locale, "Trace the selected application's input, AI processing and output/use. Record the type of impact claim you would test before opening the authored evidence.", "Theo dõi input, xử lý AI và output/cách dùng của ứng dụng đã chọn. Ghi lại loại tuyên bố tác động bạn sẽ kiểm tra trước khi mở bằng chứng đã viết.")} stateKey={`${useCase}-${dimension}`} onReset={() => { setUseCase(defaults.useCase); setDimension(defaults.dimension); }} controls={<><Select id="p1-l43-use-case" label={copy(locale, "AI application", "Ứng dụng AI")} value={useCase} onChange={(event) => setUseCase(event.target.value as AiUseCase)}>{AI_USE_CASES.map((id) => <option key={id} value={id}>{local(locale, AI_APP_COPY[id].title)}</option>)}</Select><Select id="p1-l43-dimension" label={copy(locale, "Impact dimension", "Chiều tác động")} value={dimension} onChange={(event) => setDimension(event.target.value as AiDimension)}>{AI_IMPACT_DIMENSIONS.map((id) => <option key={id} value={id}>{local(locale, DIMENSION_COPY[id])}</option>)}</Select><div className={styles.conditionCard}><strong>{copy(locale, "Application mechanism visible before prediction", "Cơ chế ứng dụng hiển thị trước dự đoán")}</strong><span>{local(locale, appCopy.input)} → {local(locale, appCopy.task)} → {local(locale, appCopy.output)}</span></div></>} prediction={{ prompt: copy(locale, "Before the authored impact evidence is revealed, which type of claim is most defensible to test?", "Trước khi mở bằng chứng tác động đã viết, loại tuyên bố nào đáng kiểm tra nhất?"), responsePrompt: copy(locale, "Justify your chosen claim type with a causal because-clause based on the displayed mechanism.", "Giải thích loại tuyên bố đã chọn bằng mệnh đề vì sao có quan hệ nhân quả dựa trên cơ chế đang hiển thị."), choices: [{ id: "balanced", label: copy(locale, "A qualified claim that tests more than one possible consequence", "Tuyên bố có điều kiện kiểm tra nhiều hơn một hệ quả có thể xảy ra") }, { id: "benefit-only", label: copy(locale, "The application label alone proves an overall benefit", "Chỉ nhãn ứng dụng đã chứng minh lợi ích tổng thể") }, { id: "risk-only", label: copy(locale, "The application label alone proves an overall harm", "Chỉ nhãn ứng dụng đã chứng minh tác hại tổng thể") }], expectedChoiceId: "balanced", rubric: [copy(locale, "Explain input → AI processing → output/use.", "Giải thích input → xử lý AI → output/cách dùng."), copy(locale, "Name the stakeholder or resource change.", "Nêu bên liên quan hoặc thay đổi tài nguyên."), copy(locale, "Link one benefit through a causal mechanism.", "Liên kết một lợi ích qua cơ chế nhân quả."), copy(locale, "Link one risk and condition; avoid statistics or universal claims.", "Liên kết một rủi ro và điều kiện; tránh thống kê hoặc tuyên bố phổ quát.")] }} scenes={scenes} />;
}

export function Chapter7VisualLab({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  if (lessonId === "P1-L41") return <EthicsLab locale={locale} />;
  if (lessonId === "P1-L42") return <LicenceLab locale={locale} />;
  if (lessonId === "P1-L43") return <AiLab locale={locale} />;
  return null;
}

export const chapter7VisualLessonIds: readonly string[] = ["P1-L41", "P1-L42", "P1-L43"];
