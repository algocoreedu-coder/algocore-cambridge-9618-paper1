export type ModelFrame<T> = Readonly<{
  id: string;
  state: T;
  activeIds: readonly string[];
  ticket: string;
}>;

export type Chapter8Locale = "en" | "vi";
type Chapter8LocalText = Readonly<{ en: string; vi: string }>;
const chapter8Tx = (en: string, vi: string): Chapter8LocalText => ({ en, vi });

const CHAPTER8_SEMANTIC_COPY: Readonly<Record<string, Chapter8LocalText>> = {
  "observe-duplicate-files": chapter8Tx("Observe duplicate files", "Quan sát các tệp trùng lặp"),
  "apply-change": chapter8Tx("Apply the change", "Áp dụng thay đổi"),
  "trace-propagation": chapter8Tx("Trace propagation", "Truy vết sự lan truyền"),
  "compare-integrity": chapter8Tx("Compare integrity controls", "So sánh kiểm soát toàn vẹn"),
  "inspect-schema": chapter8Tx("Inspect the schema", "Kiểm tra schema"),
  "declare-key": chapter8Tx("Declare the key", "Khai báo khóa"),
  "apply-operation": chapter8Tx("Apply the record operation", "Áp dụng thao tác bản ghi"),
  "verify-relationship": chapter8Tx("Verify the relationship", "Kiểm chứng quan hệ"),
  "declare-dependencies": chapter8Tx("Declare functional dependencies", "Khai báo functional dependency"),
  "reach-1nf": chapter8Tx("Reach 1NF", "Đạt 1NF"), "reach-2nf": chapter8Tx("Reach 2NF", "Đạt 2NF"), "reach-3nf": chapter8Tx("Reach 3NF", "Đạt 3NF"),
  "verify-lossless-links": chapter8Tx("Verify lossless links", "Kiểm chứng liên kết bảo toàn dữ kiện"),
  "inspect-request": chapter8Tx("Inspect the request", "Kiểm tra yêu cầu"),
  "route-responsibility": chapter8Tx("Route responsibility", "Chuyển trách nhiệm"),
  "invoke-dbms-tool": chapter8Tx("Invoke the DBMS tool", "Gọi công cụ DBMS"),
  "verify-control": chapter8Tx("Verify the control", "Kiểm chứng kiểm soát"),
  "read-statement": chapter8Tx("Read the statement", "Đọc câu lệnh"),
  "predict-language-role": chapter8Tx("Predict the language role", "Dự đoán vai trò ngôn ngữ"),
  "trace-target": chapter8Tx("Trace the target", "Truy vết mục tiêu"),
  "verify-effect": chapter8Tx("Verify the effect", "Kiểm chứng ảnh hưởng"),
  "inspect-requirement": chapter8Tx("Inspect the requirement", "Kiểm tra yêu cầu"),
  "assemble-ddl": chapter8Tx("Assemble DDL", "Lắp ghép DDL"),
  "apply-schema-change": chapter8Tx("Apply the schema change", "Áp dụng thay đổi schema"),
  "verify-constraint": chapter8Tx("Verify the constraint", "Kiểm chứng ràng buộc"),
  parse: chapter8Tx("Parse the statement", "Phân tích câu lệnh"), source: chapter8Tx("Identify source tables", "Xác định bảng nguồn"), match: chapter8Tx("Match rows", "Xác định hàng thỏa"), transform: chapter8Tx("Transform rows or results", "Biến đổi hàng hoặc kết quả"), result: chapter8Tx("Verify the result", "Kiểm chứng kết quả"),
  "relational-design-reduces-redundancy-and-dependence-but-does-not-eliminate-bad-input-poor-design-or-unauthorised-access": chapter8Tx("Relational design reduces redundancy and dependence, but it does not eliminate bad input, poor design or unauthorised access.", "Thiết kế quan hệ giảm dư thừa và phụ thuộc, nhưng không loại bỏ dữ liệu nhập sai, thiết kế kém hoặc truy cập trái phép."),
  "logical-tool-responsibility-not-a-physical-query-plan": chapter8Tx("This is a logical tool-responsibility trace, not a physical query plan.", "Đây là truy vết trách nhiệm logic của công cụ, không phải kế hoạch thực thi truy vấn vật lý."),
  "logical-teaching-trace-not-a-physical-execution-plan": chapter8Tx("This is a logical teaching trace, not a physical execution plan.", "Đây là truy vết logic phục vụ học tập, không phải kế hoạch thực thi vật lý."),
  "logical-teaching-trace-not-an-optimizer-plan": chapter8Tx("This is a logical teaching trace, not an optimiser plan.", "Đây là truy vết logic phục vụ học tập, không phải kế hoạch của bộ tối ưu."),
  "Cambridge-9618-declared-teaching-subset-SQL-dialects-vary": chapter8Tx("Cambridge 9618 declared teaching subset; SQL dialects vary.", "Tập con giảng dạy Cambridge 9618 đã khai báo; các dialect SQL có thể khác nhau."),
  "Cambridge-9618-declared-teaching-subset-not-a-universal-vendor-validator": chapter8Tx("Cambridge 9618 teaching subset; this is not a universal vendor validator.", "Tập con giảng dạy Cambridge 9618; đây không phải trình kiểm tra dùng chung cho mọi nhà cung cấp."),
  "Cambridge-9618-logical-teaching-trace-SQL-dialects-and-physical-plans-vary": chapter8Tx("Cambridge 9618 logical teaching trace; SQL dialects and physical plans vary.", "Truy vết logic Cambridge 9618 phục vụ học tập; dialect SQL và kế hoạch vật lý có thể khác nhau."),
  "creating-a-backup-alone-does-not-prove-recoverability-or-prevent-the-original-incident": chapter8Tx("Creating a backup alone does not prove recoverability or prevent the original incident.", "Chỉ tạo bản sao lưu chưa chứng minh khả năng khôi phục và không ngăn được sự cố ban đầu."),
  "access-rights-reduce-unauthorised-actions-but-do-not-prevent-every-breach": chapter8Tx("Access rights reduce unauthorised actions but do not prevent every breach.", "Quyền truy cập làm giảm hành động trái phép nhưng không ngăn được mọi vi phạm."),
  "matching-reference-does-not-prove-every-business-value-factually-correct": chapter8Tx("A matching reference does not prove that every business value is factually correct.", "Tham chiếu khớp không chứng minh mọi giá trị nghiệp vụ đều đúng với thực tế."),
  "DELETE-is-not-DROP-TABLE": chapter8Tx("DELETE is not DROP TABLE; the table structure remains.", "DELETE không phải DROP TABLE; cấu trúc bảng vẫn còn."),
  "all-rows-deleted-but-the-Booking-table-schema-remains": chapter8Tx("All rows are deleted, but the Booking table schema remains.", "Tất cả hàng bị xóa nhưng schema của bảng Booking vẫn còn."),
  "rejected-key-proposal-invalid-or-non-minimal-no-committed-mutation": chapter8Tx("Rejected: the key proposal is invalid or non-minimal, so no mutation is committed.", "Bị từ chối: đề xuất khóa không hợp lệ hoặc không tối thiểu, nên không có thay đổi nào được commit."),
  "rejected-orphan-reference-no-committed-mutation": chapter8Tx("Rejected: the reference would be orphaned, so no mutation is committed.", "Bị từ chối: tham chiếu sẽ bị mồ côi, nên không có thay đổi nào được commit."),
  "accepted-valid-key-and-reference-exist": chapter8Tx("Accepted: the key is valid and the referenced value exists.", "Được chấp nhận: khóa hợp lệ và giá trị được tham chiếu tồn tại."),
  file_based: chapter8Tx("File-based storage", "Lưu trữ dựa trên tệp"),
  relational: chapter8Tx("Relational storage", "Lưu trữ quan hệ"),
  employee_contact_change: chapter8Tx("Employee contact change", "Thay đổi liên hệ nhân viên"),
  customer_address_change: chapter8Tx("Customer address change", "Thay đổi địa chỉ khách hàng"),
  new_cross_function_enquiry: chapter8Tx("New cross-function enquiry", "Yêu cầu tra cứu liên phòng ban mới"),
  person_passport: chapter8Tx("Person and passport schema", "Schema Person và Passport"),
  class_student: chapter8Tx("Class and student schema", "Schema Class và Student"),
  student_subject_enrolment: chapter8Tx("Student, subject and enrolment schema", "Schema Student, Subject và Enrolment"),
  club_member_contacts: chapter8Tx("Club member contacts dataset", "Bộ dữ liệu liên hệ thành viên câu lạc bộ"),
  order_product_lines: chapter8Tx("Order and product lines dataset", "Bộ dữ liệu đơn hàng và dòng sản phẩm"),
  course_class_teacher: chapter8Tx("Course, class and teacher dataset", "Bộ dữ liệu khóa học, lớp và giáo viên"),
  correct_declared_set: chapter8Tx("Diagnosis from declared dependencies", "Chẩn đoán từ các phụ thuộc đã khai báo"),
  incorrect_diagnosis: chapter8Tx("Unsupported diagnosis", "Chẩn đoán không được hỗ trợ"),
  valid_minimal: chapter8Tx("Valid minimal key", "Khóa tối thiểu hợp lệ"),
  invalid_or_non_minimal: chapter8Tx("Invalid or non-minimal key", "Khóa không hợp lệ hoặc không tối thiểu"),
  valid_reference: chapter8Tx("Valid reference", "Tham chiếu hợp lệ"),
  violating_operation: chapter8Tx("Operation that violates the reference rule", "Thao tác vi phạm quy tắc tham chiếu"),
  create_database: chapter8Tx("Create database", "Tạo cơ sở dữ liệu"),
  create_table: chapter8Tx("Create table", "Tạo bảng"),
  create_table_types: chapter8Tx("Create table with declared types", "Tạo bảng với các kiểu đã khai báo"),
  alter_table: chapter8Tx("Alter table", "Thay đổi bảng"),
  primary_key: chapter8Tx("Primary key", "Khóa chính"),
  foreign_key_references: chapter8Tx("Foreign-key reference", "Tham chiếu khóa ngoại"),
  select_from_where: chapter8Tx("SELECT FROM WHERE", "SELECT FROM WHERE"),
  select_where: chapter8Tx("SELECT WHERE", "SELECT WHERE"),
  inner_join: chapter8Tx("INNER JOIN", "INNER JOIN"),
  inner_join_two_tables: chapter8Tx("Two-table INNER JOIN", "INNER JOIN hai bảng"),
  insert_row: chapter8Tx("INSERT row", "INSERT hàng"),
  insert_full_row: chapter8Tx("INSERT complete row", "INSERT hàng đầy đủ"),
  insert_explicit_columns: chapter8Tx("INSERT with explicit columns", "INSERT với danh sách cột tường minh"),
  update_where: chapter8Tx("UPDATE WHERE", "UPDATE WHERE"),
  delete_where: chapter8Tx("DELETE WHERE", "DELETE WHERE"),
  delete_without_where: chapter8Tx("DELETE without WHERE", "DELETE không có WHERE"),
  order_by: chapter8Tx("ORDER BY", "ORDER BY"),
  group_by_count: chapter8Tx("GROUP BY with COUNT", "GROUP BY với COUNT"),
  sum_avg: chapter8Tx("SUM and AVG", "SUM và AVG"),
  "apply-selected-change": chapter8Tx("Apply the selected change", "Áp dụng thay đổi đã chọn"),
  "trace-required-path": chapter8Tx("Trace the required path", "Truy vết đường dẫn bắt buộc"),
  "compare-controls": chapter8Tx("Compare the controls", "So sánh các biện pháp kiểm soát"),
  "source-and-match-not-revealed": chapter8Tx("Source and match are not revealed", "Chưa mở nguồn và các hàng thỏa điều kiện"),
  "target-and-effect-not-revealed": chapter8Tx("Target and effect are not revealed", "Chưa mở mục tiêu và ảnh hưởng"),
  "tool-and-control-not-revealed": chapter8Tx("Tool and control are not revealed", "Chưa mở công cụ và biện pháp kiểm soát"),
  "database-administrator": chapter8Tx("Database administrator", "Quản trị viên cơ sở dữ liệu"),
  "database-developer": chapter8Tx("Database developer", "Nhà phát triển cơ sở dữ liệu"),
  "declared-relations-and-domain-rules": chapter8Tx("Declared relations and domain rules", "Các quan hệ và quy tắc miền đã khai báo"),
  "declared-source-facts": chapter8Tx("Declared source facts", "Các dữ kiện nguồn đã khai báo"),
  "row-after-state": chapter8Tx("Committed row after-state", "Trạng thái hàng sau khi commit"),
  "PRIMARY-KEY": chapter8Tx("PRIMARY KEY", "Khóa chính"),
  "foreign-and-referenced-key-types-are-incompatible": chapter8Tx("Foreign-key and referenced-key types are incompatible", "Kiểu dữ liệu của khóa ngoại và khóa được tham chiếu không tương thích"),
  "link-Booking.EventID-to-Event.EventID": chapter8Tx("Link Booking.EventID to Event.EventID", "Liên kết Booking.EventID tới Event.EventID"),
  "grant-analyst-read-only-booking-access": chapter8Tx("Grant the analyst read-only access to Booking", "Cấp cho chuyên viên phân tích quyền chỉ đọc bảng Booking"),
  "prove-the-nightly-backup-can-be-restored": chapter8Tx("Prove that the nightly backup can be restored", "Chứng minh bản sao lưu hằng đêm có thể khôi phục"),
  "require-every-booking-to-reference-an-event": chapter8Tx("Require every booking to reference an event", "Yêu cầu mọi bản ghi Booking tham chiếu một Event"),
  "test-two-table-booking-summary-query": chapter8Tx("Test the two-table booking summary query", "Kiểm thử truy vấn tóm tắt Booking dùng hai bảng"),
};

const CHAPTER8_VI_TOKEN: Readonly<Record<string, string>> = {
  accepted: "được chấp nhận", rejected: "bị từ chối", valid: "hợp lệ", invalid: "không hợp lệ", minimal: "tối thiểu", non: "không", revealed: "đã mở", pending: "đang chờ", none: "không có",
  source: "nguồn", record: "bản ghi", records: "bản ghi", relation: "quan hệ", relations: "các quan hệ", separate: "tách biệt", application: "ứng dụng", views: "khung nhìn", authoritative: "có thẩm quyền",
  change: "thay đổi", update: "cập nhật", target: "mục tiêu", targets: "các mục tiêu", apply: "áp dụng", selected: "đã chọn", trace: "truy vết", path: "đường dẫn", propagation: "lan truyền", compare: "so sánh", controls: "kiểm soát",
  outcome: "kết quả", effect: "ảnh hưởng", evidence: "bằng chứng", limitation: "giới hạn", conflict: "xung đột", inconsistency: "không nhất quán", duplicate: "trùng lặp", redundancy: "dư thừa", dependence: "phụ thuộc",
  program: "chương trình", data: "dữ liệu", query: "truy vấn", result: "kết quả", rows: "các hàng", row: "hàng", structure: "cấu trúc", schema: "schema", table: "bảng", field: "trường", column: "cột", columns: "các cột",
  key: "khóa", primary: "chính", secondary: "phụ", candidate: "ứng viên", foreign: "ngoại", reference: "tham chiếu", integrity: "toàn vẹn", constraint: "ràng buộc", cardinality: "lực lượng", index: "chỉ mục",
  declared: "đã khai báo", domain: "miền", rule: "quy tắc", rules: "các quy tắc", exists: "tồn tại", missing: "còn thiếu", orphan: "mồ côi", committed: "đã commit", mutation: "thay đổi dữ liệu",
  dependency: "phụ thuộc", dependencies: "các phụ thuộc", diagnosis: "chẩn đoán", repeating: "lặp", partial: "bộ phận", transitive: "bắc cầu", remove: "loại bỏ", reconstruct: "tái dựng", facts: "dữ kiện", preserved: "được bảo toàn",
  role: "vai trò", responsibility: "trách nhiệm", tool: "công cụ", developer: "nhà phát triển", interface: "giao diện", processor: "bộ xử lý", access: "truy cập", security: "bảo mật", backup: "sao lưu", restore: "khôi phục", recovery: "phục hồi",
  statement: "câu lệnh", language: "ngôn ngữ", dialect: "dialect", physical: "vật lý", execution: "thực thi", plan: "kế hoạch", prospective: "dự kiến", assemble: "lắp ghép", create: "tạo", alter: "thay đổi", insert: "thêm", delete: "xóa", without: "không có", where: "WHERE",
  match: "khớp", matched: "đã khớp", project: "chiếu", group: "nhóm", aggregate: "tổng hợp", sort: "sắp xếp", affected: "bị ảnh hưởng", all: "tất cả", unchanged: "không đổi", ready: "sẵn sàng",
  does: "", not: "không", eliminate: "loại bỏ", poor: "kém", unauthorised: "trái phép", logical: "logic", teaching: "giảng dạy", vary: "có thể khác nhau", one: "một", two: "hai", existing: "hiện có",
  employee: "nhân viên", customer: "khách hàng", contact: "liên hệ", address: "địa chỉ", changes: "thay đổi", from: "từ", to: "sang", request: "yêu cầu", case: "hồ sơ", owner: "người phụ trách", invoice: "hóa đơn", status: "trạng thái", combined: "kết hợp", new: "mới",
  payroll: "bảng lương", sales: "bán hàng", orders: "đơn hàng", support: "hỗ trợ", billing: "thanh toán", file: "tệp", layout: "bố cục", knows: "biết", understand: "hiểu", independent: "độc lập", controlled: "được kiểm soát",
  parent: "cha", operation: "thao tác", proposal: "đề xuất", identifier: "định danh", alternate: "thay thế", sample: "mẫu", appearance: "hình thức",
  creates: "tạo", modifies: "thay đổi", adds: "thêm", removes: "xóa", filters: "lọc", projects: "chiếu", joins: "join", derives: "tính", displayed: "được hiển thị", inputs: "đầu vào", preserves: "giữ nguyên", quoted: "được đặt trong dấu nháy", text: "văn bản",
  based: "dựa trên", required: "bắt buộc", every: "mọi", possible: "có thể", error: "lỗi", errors: "lỗi", storage: "lưu trữ", model: "mô hình",
  database: "cơ sở dữ liệu", administrator: "quản trị viên", analyst: "chuyên viên phân tích", authorised: "được cấp quyền", read: "đọc", write: "ghi", only: "chỉ", nightly: "hằng đêm", can: "có thể", restored: "được khôi phục", require: "yêu cầu", event: "sự kiện", capacity: "sức chứa", summary: "bản tóm tắt",
  subset: "tập con", universal: "phổ quát", vendor: "nhà cung cấp", validator: "trình kiểm tra", syntax: "cú pháp", token: "token", types: "kiểu dữ liệu", spelled: "được viết đúng", assigned: "được gán", compatible: "tương thích", purposes: "mục đích",
  name: "tên", present: "có mặt", keyword: "từ khóa", list: "danh sách", uses: "dùng", parentheses: "dấu ngoặc đơn", identifies: "xác định", referenced: "được tham chiếu", are: "là", incompatible: "không tương thích",
  inspect: "kiểm tra", parsed: "đã phân tích", interpreted: "đã diễn giải", executed: "đã thực thi", returned: "đã trả về", commit: "commit", return: "trả về", verify: "kiểm chứng", complete: "hoàn tất", yet: "chưa", assembled: "được lắp ghép",
  through: "qua", links: "liên kết", defined: "đã định nghĩa", recorded: "đã ghi", container: "vùng chứa", values: "giá trị", matching: "thỏa điều kiện", mutating: "làm thay đổi", at: "tối đa", most: "nhiều nhất", on: "trên", link: "liên kết",
  strongest: "mạnh nhất", remains: "vẫn còn", visible: "có thể quan sát", old: "cũ", blocks: "cản trở", report: "báo cáo", must: "phải", multiple: "nhiều", coordinated: "được phối hợp", consistent: "nhất quán", retrieval: "truy xuất",
  class: "lớp", students: "học sinh", subject: "môn học", subjects: "môn học", enrolment: "đăng ký học", person: "người", passport: "hộ chiếu", many: "nhiều", resolved: "được giải quyết", by: "bởi",
  satisfy: "thỏa mãn", identity: "định danh", decides: "quyết định", relationship: "quan hệ", direction: "chiều", indexing: "lập chỉ mục",
  functional: "hàm", normalisation: "chuẩn hóa", supported: "được hỗ trợ", unsupported: "không được hỗ trợ", composite: "kết hợp", violates: "vi phạm", already: "đã", satisfied: "thỏa mãn", removing: "loại bỏ", groups: "các nhóm", lossless: "bảo toàn dữ kiện",
  rights: "quyền", control: "kiểm soát", privilege: "đặc quyền", applied: "đã áp dụng", isolated: "cô lập", completed: "đã hoàn tất", verified: "đã kiểm chứng", recoverability: "khả năng khôi phục", demonstrated: "đã chứng minh", tested: "đã kiểm thử", protected: "được bảo vệ", asset: "tài sản",
  stored: "được lưu", projection: "phép chiếu", state: "trạng thái", copied: "được sao chép", transformed: "đã biến đổi", ordered: "đã sắp xếp", keys: "các khóa", promised: "được bảo đảm",
  exact: "chính xác", fault: "lỗi", prevents: "ngăn", seven: "bảy", syllabus: "syllabus", type: "kiểu", fields: "các trường", active: "đang hoạt động", cancelled: "đã hủy",
  filtered: "đã lọc", then: "sau đó", same: "cùng", order: "thứ tự", average: "trung bình", rounded: "được làm tròn", four: "bốn", decimal: "thập phân", places: "chữ số", explicit: "tường minh", maps: "ánh xạ", updates: "cập nhật", deletes: "xóa",
  adult: "người lớn", open: "đang mở", science: "khoa học", robotics: "robotics", networks: "mạng máy tính",
  location: "vị trí", retains: "giữ lại", the: "", value: "giá trị", relational: "quan hệ", in: "trong", no: "không", this: "này", and: "và", for: "cho", of: "của", view: "khung nhìn", verdict: "kết luận",
  student: "học sinh", club: "câu lạc bộ", contacts: "liên hệ", member: "thành viên", or: "hoặc", reconstructed: "đã tái dựng", lines: "các dòng", product: "sản phẩm", course: "khóa học", teacher: "giáo viên",
  add: "thêm", verification: "kiểm chứng", booking: "đặt chỗ", test: "kiểm thử", grant: "cấp", least: "tối thiểu", an: "", referential: "tham chiếu", be: "được", prove: "chứng minh", a: "", tables: "các bảng",
  inserts: "thêm", with: "với", validity: "tính hợp lệ", is: "là", as: "là", declare: "khai báo", use: "dùng", transform: "biến đổi", mutate: "thay đổi dữ liệu", after: "sau",
  files: "các tệp", business: "nghiệp vụ", compared: "đã so sánh", coordination: "phối hợp", copies: "các bản sao", fact: "dữ kiện", layouts: "các bố cục", original: "ban đầu", applications: "các ứng dụng", relationships: "các quan hệ", cases: "các hồ sơ", cross: "liên phòng ban", enquiry: "yêu cầu tra cứu", function: "chức năng", current: "hiện tại", each: "mỗi", fixture: "fixture", has: "có", number: "số", per: "mỗi", under: "theo", but: "nhưng",
  email: "email", enforce: "thực thi", output: "đầu ra", supports: "hỗ trợ", have: "có", roster: "danh sách lớp", pair: "cặp", take: "học", lookups: "tra cứu", references: "các tham chiếu", results: "kết quả", validate: "kiểm tra", belongs: "thuộc về", atomic: "nguyên tử", incorrect: "không chính xác", violate: "vi phạm", price: "giá", quantity: "số lượng", line: "dòng", repeated: "bị lặp", via: "qua", taught: "được dạy bởi", consistently: "nhất quán", retained: "được giữ lại", unique: "duy nhất", validation: "kiểm tra hợp lệ", attribute: "thuộc tính", gains: "được thêm",
  may: "có thể", applies: "áp dụng", demo: "mô phỏng", engine: "hệ thống thực thi", it: "nó", submits: "gửi", inspected: "đã kiểm tra", join: "join", right: "quyền", metadata: "metadata", object: "đối tượng", correct: "đúng", permission: "quyền", allowed: "được cho phép", denied: "bị từ chối", remain: "vẫn còn", set: "tập", version: "phiên bản", copy: "bản sao", matches: "khớp", check: "kiểm tra", compares: "so sánh", count: "số lượng", expected: "mong đợi", restricted: "bị giới hạn", approved: "được phê duyệt", definitions: "định nghĩa", derived: "được suy ra", limited: "bị giới hạn", authorisation: "ủy quyền", beyond: "vượt ngoài", factually: "theo thực tế",
  handling: "xử lý", exist: "tồn tại", details: "chi tiết", finite: "hữu hạn", outside: "nằm ngoài", transaction: "giao dịch", added: "đã thêm", minimum: "tối thiểu", seats: "chỗ ngồi", stable: "ổn định", tie: "đồng hạng", core: "cốt lõi", category: "nhóm", limit: "giới hạn", inserted: "đã thêm", id: "ID", updated: "đã cập nhật", deleted: "đã xóa", clause: "mệnh đề",
};

const CHAPTER8_SQL_STATEMENT = /^(?:SELECT|CREATE|ALTER|INSERT|UPDATE|DELETE)\b/i;
const chapter8Humanise = (value: string) => value.replaceAll("->", " → ").replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const chapter8IsTechnicalAtom = (value: string) =>
  value === "" ||
  /[A-Z0-9@.()'=;><]/.test(value) ||
  /^(?:true|false|DDL|DML|PK|FK|DBMS|SQL|NULL)$/i.test(value);

const chapter8VietnameseAtom = (value: string): string => {
  const exact = CHAPTER8_SEMANTIC_COPY[value];
  if (exact) return exact.vi;
  const token = CHAPTER8_VI_TOKEN[value.toLowerCase()];
  if (token !== undefined) return token;
  return value;
};

const chapter8VietnameseString = (value: string): string => {
  const exact = CHAPTER8_SEMANTIC_COPY[value];
  if (exact) return exact.vi;
  if (CHAPTER8_SQL_STATEMENT.test(value)) return value;
  if (value.includes("|")) return value.split("|").map(chapter8VietnameseString).join(" · ");
  if (value.includes("->")) return value.split("->").map(chapter8VietnameseString).join(" → ");
  if (value.includes(":")) return value.split(":").map(chapter8VietnameseString).filter(Boolean).join(": ");
  if (value.includes("_")) return value.split("_").map(chapter8VietnameseString).join(" ");
  if (value.includes("+")) return value.split("+").map(chapter8VietnameseString).join(" + ");
  if (value.includes("-") && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.split("-").map(chapter8VietnameseAtom).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }
  return chapter8VietnameseAtom(value);
};

/** Pure presentation formatter used by both the React view and the exhaustive model validator. */
export const chapter8SemanticText = (locale: Chapter8Locale, value: unknown): string => {
  if (Array.isArray(value)) return value.length ? value.map((item) => chapter8SemanticText(locale, item)).join(" · ") : "—";
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => `${chapter8SemanticText(locale, key)}: ${chapter8SemanticText(locale, item)}`).join("; ");
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === "" || value === null || value === undefined) return "—";
  if (typeof value !== "string") return String(value);
  const exact = CHAPTER8_SEMANTIC_COPY[value];
  if (exact) return exact[locale];
  return locale === "en" ? (CHAPTER8_SQL_STATEMENT.test(value) ? value : chapter8Humanise(value)) : chapter8VietnameseString(value);
};

/** Returns semantic slug atoms that still need an explicit Vietnamese presentation entry. */
export const chapter8UnmappedVietnameseTokens = (value: unknown): readonly string[] => {
  const missing = new Set<string>();
  const visit = (entry: unknown): void => {
    if (Array.isArray(entry)) { entry.forEach(visit); return; }
    if (entry && typeof entry === "object") { Object.entries(entry).forEach(([key, item]) => { visit(key); visit(item); }); return; }
    if (typeof entry !== "string" || CHAPTER8_SQL_STATEMENT.test(entry) || CHAPTER8_SEMANTIC_COPY[entry]) return;
    for (const atom of entry.split(/\||->|:|_|\+|-/).filter(Boolean)) {
      if (!chapter8IsTechnicalAtom(atom) && /^[a-z]+$/i.test(atom) && CHAPTER8_VI_TOKEN[atom.toLowerCase()] === undefined && CHAPTER8_SEMANTIC_COPY[atom] === undefined) missing.add(atom);
    }
  };
  visit(value);
  return [...missing].sort();
};


type Row = Readonly<Record<string, string | number | boolean>>;
type Relation = Readonly<{ name: string; columns: readonly string[]; rows: readonly Row[] }>;

export type Chapter8RevealMap = Readonly<{
  source: string;
  operation: string;
  result: string;
  ledgerFields: readonly string[];
  tableFields: readonly string[];
}>;

const revealMap = (
  source: string,
  operation: string,
  result: string,
  ledgerFields: readonly string[],
  tableFields: readonly string[] = [],
): Chapter8RevealMap => ({ source, operation, result, ledgerFields, tableFields });

const immutableRows = (rows: readonly Row[]) => rows.map((row) => ({ ...row }));
const sameRows = (rows: readonly Row[]) => immutableRows(rows);

export const L44_RECORD_CHANGES = Object.freeze([
  "employee_contact_change",
  "customer_address_change",
  "new_cross_function_enquiry",
] as const);
export const L44_STORAGE_MODELS = Object.freeze(["file_based", "relational"] as const);
export const L44_FRAMES = Object.freeze([
  "observe-duplicate-files",
  "apply-change",
  "trace-propagation",
  "compare-integrity",
] as const);
export type L44RecordChange = typeof L44_RECORD_CHANGES[number];
export type L44StorageModel = typeof L44_STORAGE_MODELS[number];
export type L44Frame = typeof L44_FRAMES[number];

type L44Fixture = Readonly<{
  businessFact: string;
  provenanceTag: string;
  sourceRecords: readonly Row[];
  updatedValue: string;
  updateTargets: readonly string[];
  programDependencies: readonly string[];
}>;

const L44_FIXTURES: Readonly<Record<L44RecordChange, L44Fixture>> = {
  employee_contact_change: {
    businessFact: "employee-E17-contact-changes-from-0123-to-0799",
    provenanceTag: "R17",
    sourceRecords: [
      { source: "payroll-file", recordId: "E17", contact: "0123" },
      { source: "sales-file", recordId: "E17", contact: "0123" },
    ],
    updatedValue: "0799",
    updateTargets: ["payroll-file:E17", "sales-file:E17"],
    programDependencies: ["payroll-program-knows-payroll-layout", "sales-program-knows-sales-layout"],
  },
  customer_address_change: {
    businessFact: "customer-C08-address-changes-from-Bay-Road-to-Pine-Lane",
    provenanceTag: "R08",
    sourceRecords: [
      { source: "orders-file", recordId: "C08", address: "Bay Road" },
      { source: "support-file", recordId: "C08", address: "Bay Road" },
    ],
    updatedValue: "Pine Lane",
    updateTargets: ["orders-file:C08", "support-file:C08"],
    programDependencies: ["orders-program-knows-orders-layout", "support-program-knows-support-layout"],
  },
  new_cross_function_enquiry: {
    businessFact: "request-one-view-of-case-owner-and-invoice-status-for-C22",
    provenanceTag: "R22",
    sourceRecords: [
      { source: "cases-file", recordId: "C22", owner: "Team North" },
      { source: "billing-file", recordId: "C22", invoiceStatus: "open" },
    ],
    updatedValue: "combined-view-requested",
    updateTargets: ["cases-file:C22", "billing-file:C22"],
    programDependencies: ["new-report-must-understand-two-independent-layouts"],
  },
};

export type L44State = Readonly<{
  recordChange: L44RecordChange;
  storageModel: L44StorageModel;
  phase: L44Frame;
  provenanceTag: string;
  businessFact: string;
  sourceRecords: readonly Row[];
  sourceStructure: "separate-application-files" | "one-authoritative-relation-with-application-views";
  authoritativeRecordCount: number;
  applicationReferenceCount: number;
  storedCopyCount: number;
  updateTargets: readonly string[];
  programDependencies: readonly string[];
  inconsistencyFlags: readonly string[];
  resultRecords: readonly Row[];
  evidence: readonly string[];
  limitation: string;
  allErrorsEliminated: false;
  reveal: Chapter8RevealMap;
}>;

export function buildL44RelationalProofbenchState(recordChange: L44RecordChange, storageModel: L44StorageModel, phase: L44Frame): L44State {
  const fixture = L44_FIXTURES[recordChange];
  const isFile = storageModel === "file_based";
  const isEnquiry = recordChange === "new_cross_function_enquiry";
  const relationalSourceRecords: readonly Row[] = recordChange === "employee_contact_change"
    ? [{ relation: "Employee", recordId: "E17", contact: "0123", applicationViews: "payroll-view|sales-view" }]
    : recordChange === "customer_address_change"
      ? [{ relation: "Customer", recordId: "C08", address: "Bay Road", applicationViews: "orders-view|support-view" }]
      : [{ relation: "CaseAccount", recordId: "C22", owner: "Team North", invoiceStatus: "open", applicationViews: "case-view|billing-view|combined-query" }];
  const sourceRecords = isFile ? immutableRows(fixture.sourceRecords) : immutableRows(relationalSourceRecords);
  const resultRecords = isEnquiry
    ? sameRows(sourceRecords)
    : sourceRecords.map((row, index) => ({ ...row, ...(Object.hasOwn(row, "contact") ? { contact: index === 0 || !isFile ? fixture.updatedValue : row.contact } : { address: index === 0 || !isFile ? fixture.updatedValue : row.address }) }));
  const updateTargets = isFile ? [...fixture.updateTargets] : [`${recordChange}:one-authoritative-record`];
  const inconsistencyFlags = phase === "trace-propagation" || phase === "compare-integrity"
    ? isFile
      ? [isEnquiry ? "program-data-dependence-blocks-the-new-combined-view" : "one-duplicate-location-retains-the-old-value"]
      : ["no-conflict-in-this-controlled-update"]
    : [];
  const reveal = phase === "observe-duplicate-files"
    ? revealMap(fixture.businessFact, "change-not-applied", "outcome-not-revealed", ["sourceStructure", "authoritativeRecordCount", "applicationReferenceCount", "storedCopyCount", "programDependencies"], ["sourceRecords"])
    : phase === "apply-change"
      ? revealMap(fixture.businessFact, `${storageModel}:apply-selected-change`, "propagation-not-revealed", ["sourceStructure", "authoritativeRecordCount", "applicationReferenceCount", "storedCopyCount", "programDependencies", "updateTargets"], ["sourceRecords", "resultRecords"])
      : phase === "trace-propagation"
        ? revealMap(fixture.businessFact, `${storageModel}:trace-required-path`, inconsistencyFlags[0] ?? "no-conflict", ["sourceStructure", "authoritativeRecordCount", "applicationReferenceCount", "storedCopyCount", "programDependencies", "updateTargets", "inconsistencyFlags"], ["sourceRecords", "resultRecords"])
        : revealMap(fixture.businessFact, `${storageModel}:compare-controls`, inconsistencyFlags[0] ?? "no-conflict", ["sourceStructure", "authoritativeRecordCount", "applicationReferenceCount", "storedCopyCount", "programDependencies", "updateTargets", "inconsistencyFlags", "evidence", "limitation"], ["sourceRecords", "resultRecords"]);
  return {
    recordChange,
    storageModel,
    phase,
    provenanceTag: fixture.provenanceTag,
    businessFact: fixture.businessFact,
    sourceRecords,
    sourceStructure: isFile ? "separate-application-files" : "one-authoritative-relation-with-application-views",
    authoritativeRecordCount: isFile ? 0 : 1,
    applicationReferenceCount: isFile ? 0 : 2,
    storedCopyCount: isFile ? 2 : 1,
    updateTargets: phase === "observe-duplicate-files" ? [] : updateTargets,
    programDependencies: isFile ? [...fixture.programDependencies] : ["applications-query-one-controlled-relational-schema"],
    inconsistencyFlags,
    resultRecords: phase === "observe-duplicate-files" ? sourceRecords : resultRecords,
    evidence: phase === "compare-integrity"
      ? [isFile ? "separate-copies-or-layouts-require-separate-coordination" : "one-controlled-fact-and-declared-relationships-support-consistent-retrieval", "same-original-business-fact-compared"]
      : [],
    limitation: "relational-design-reduces-redundancy-and-dependence-but-does-not-eliminate-bad-input-poor-design-or-unauthorised-access",
    allErrorsEliminated: false,
    reveal,
  };
}

export function l44RelationalProofbenchFrames(recordChange: L44RecordChange, storageModel: L44StorageModel): readonly ModelFrame<L44State>[] {
  return L44_FRAMES.map((id, index) => ({ id, state: buildL44RelationalProofbenchState(recordChange, storageModel, id), activeIds: index === 0 ? ["source", "provenance"] : index === 1 ? ["provenance", "target"] : index === 2 ? ["target", "result", "provenance"] : ["evidence", "limitation"], ticket: `R${index + 1}` }));
}

export const L45_SCHEMA_FIXTURES = Object.freeze(["person_passport", "class_student", "student_subject_enrolment"] as const);
export const L45_KEY_CHOICES = Object.freeze(["valid_minimal", "invalid_or_non_minimal"] as const);
export const L45_RECORD_OPERATIONS = Object.freeze(["valid_reference", "violating_operation"] as const);
export const L45_FRAMES = Object.freeze(["inspect-schema", "declare-key", "apply-operation", "verify-relationship"] as const);
export type L45SchemaFixture = typeof L45_SCHEMA_FIXTURES[number];
export type L45KeyChoice = typeof L45_KEY_CHOICES[number];
export type L45RecordOperation = typeof L45_RECORD_OPERATIONS[number];
export type L45Frame = typeof L45_FRAMES[number];

type L45Fixture = Readonly<{
  provenanceTag: string;
  relations: readonly Relation[];
  attributes: readonly string[];
  domainRules: readonly string[];
  candidateKeys: readonly string[];
  primaryKeys: readonly string[];
  secondaryKeys: readonly string[];
  keyProposalTarget: string;
  validKeyProposal: string;
  invalidKeyProposal: string;
  foreignKeys: readonly string[];
  cardinality: string;
  validOperation: string;
  invalidOperation: string;
  indexEffect: string;
}>;

const L45_FIXTURES: Readonly<Record<L45SchemaFixture, L45Fixture>> = {
  person_passport: {
    provenanceTag: "K11",
    relations: [
      { name: "Person", columns: ["PersonID", "Email"], rows: [{ PersonID: "P11", Email: "p11@example.test" }] },
      { name: "Passport", columns: ["PassportNo", "PersonID"], rows: [{ PassportNo: "X901", PersonID: "P11" }] },
    ],
    attributes: ["Person.PersonID", "Person.Email", "Passport.PassportNo", "Passport.PersonID"],
    domainRules: ["each-person-has-one-PersonID", "each-passport-number-identifies-one-passport", "one-current-passport-per-person-in-this-fixture"],
    candidateKeys: ["Person.PersonID", "Person.Email", "Passport.PassportNo", "Passport.PersonID"],
    primaryKeys: ["Person.PersonID", "Passport.PassportNo"],
    secondaryKeys: ["Person.Email", "Passport.PersonID"],
    keyProposalTarget: "Passport",
    validKeyProposal: "Passport.PassportNo",
    invalidKeyProposal: "Passport.(PassportNo,PersonID)",
    foreignKeys: ["Passport.PersonID->Person.PersonID"],
    cardinality: "Person-1-to-1-Passport",
    validOperation: "insert-passport-X902-for-new-person-P12",
    invalidOperation: "insert-passport-X902-for-missing-person-P99",
    indexEffect: "index-on-Person.Email-supports-email-retrieval-but-does-not-enforce-the-foreign-key-or-order-output",
  },
  class_student: {
    provenanceTag: "K24",
    relations: [
      { name: "Class", columns: ["ClassID", "Room"], rows: [{ ClassID: "C1", Room: "R4" }] },
      { name: "Student", columns: ["StudentID", "ClassID"], rows: [{ StudentID: "S24", ClassID: "C1" }] },
    ],
    attributes: ["Class.ClassID", "Class.Room", "Student.StudentID", "Student.ClassID"],
    domainRules: ["each-class-has-one-ClassID", "each-student-has-one-StudentID", "a-class-can-have-many-students"],
    candidateKeys: ["Class.ClassID", "Student.StudentID"],
    primaryKeys: ["Class.ClassID", "Student.StudentID"],
    secondaryKeys: [],
    keyProposalTarget: "Student",
    validKeyProposal: "Student.StudentID",
    invalidKeyProposal: "Student.(StudentID,ClassID)",
    foreignKeys: ["Student.ClassID->Class.ClassID"],
    cardinality: "Class-1-to-many-Student",
    validOperation: "insert-student-S25-with-ClassID-C1",
    invalidOperation: "insert-student-S25-with-missing-ClassID-C9",
    indexEffect: "index-on-Student.ClassID-supports-class-roster-retrieval-but-does-not-create-referential-integrity",
  },
  student_subject_enrolment: {
    provenanceTag: "K31",
    relations: [
      { name: "Student", columns: ["StudentID", "Name"], rows: [{ StudentID: "S31", Name: "Ari" }] },
      { name: "Subject", columns: ["SubjectID", "Title"], rows: [{ SubjectID: "CS1", Title: "Computing" }] },
      { name: "Enrolment", columns: ["StudentID", "SubjectID"], rows: [{ StudentID: "S31", SubjectID: "CS1" }] },
    ],
    attributes: ["Student.StudentID", "Subject.SubjectID", "Enrolment.StudentID", "Enrolment.SubjectID"],
    domainRules: ["students-can-take-many-subjects", "subjects-can-have-many-students", "one-enrolment-per-student-subject-pair"],
    candidateKeys: ["Student.StudentID", "Subject.SubjectID", "Enrolment.(StudentID,SubjectID)"],
    primaryKeys: ["Student.StudentID", "Subject.SubjectID", "Enrolment.(StudentID,SubjectID)"],
    secondaryKeys: [],
    keyProposalTarget: "Enrolment",
    validKeyProposal: "Enrolment.(StudentID,SubjectID)",
    invalidKeyProposal: "Enrolment.StudentID",
    foreignKeys: ["Enrolment.StudentID->Student.StudentID", "Enrolment.SubjectID->Subject.SubjectID"],
    cardinality: "Student-many-to-many-Subject-resolved-by-Enrolment",
    validOperation: "insert-enrolment-S31-CS2-after-subject-CS2-exists",
    invalidOperation: "insert-enrolment-S31-CS9-where-subject-CS9-does-not-exist",
    indexEffect: "index-on-Enrolment.SubjectID-supports-subject-lookups-but-does-not-validate-references-or-order-results",
  },
};

export type L45State = L45Fixture & Readonly<{
  schemaFixture: L45SchemaFixture;
  keyChoice: L45KeyChoice;
  recordOperation: L45RecordOperation;
  phase: L45Frame;
  chosenKey: string;
  keyVerdict: string;
  operation: string;
  constraintOutcome: string;
  committed: boolean;
  indexControlsIntegrity: false;
  evidence: readonly string[];
  reveal: Chapter8RevealMap;
}>;

export function buildL45KeyRelationState(schemaFixture: L45SchemaFixture, keyChoice: L45KeyChoice, recordOperation: L45RecordOperation, phase: L45Frame): L45State {
  const fixture = L45_FIXTURES[schemaFixture];
  const validKey = keyChoice === "valid_minimal";
  const validOperation = recordOperation === "valid_reference";
  const reveal = phase === "inspect-schema"
    ? revealMap(`${schemaFixture}:declared-relations-and-domain-rules`, "key-and-operation-not-applied", "verdict-not-revealed", ["domainRules"], ["relations"])
    : phase === "declare-key"
      ? revealMap(`${schemaFixture}:declared-relations-and-domain-rules`, validKey ? fixture.validKeyProposal : fixture.invalidKeyProposal, "operation-outcome-not-revealed", ["domainRules", "candidateKeys", "primarySecondary", "foreignKeys", "keyVerdict"], ["relations"])
      : phase === "apply-operation"
        ? revealMap(`${schemaFixture}:declared-relations-and-domain-rules`, validOperation ? fixture.validOperation : fixture.invalidOperation, "constraint-outcome-not-revealed", ["domainRules", "candidateKeys", "primarySecondary", "foreignKeys", "keyVerdict", "operation"], ["relations"])
        : revealMap(`${schemaFixture}:declared-relations-and-domain-rules`, validOperation ? fixture.validOperation : fixture.invalidOperation, `${validKey && validOperation ? "accepted" : "rejected"}:${fixture.cardinality}`, ["domainRules", "candidateKeys", "primarySecondary", "foreignKeys", "keyVerdict", "operation", "constraintOutcome", "cardinality", "indexEffect"], ["relations"]);
  return {
    ...fixture,
    schemaFixture,
    keyChoice,
    recordOperation,
    phase,
    chosenKey: validKey ? fixture.validKeyProposal : fixture.invalidKeyProposal,
    keyVerdict: phase === "inspect-schema" ? "not-revealed" : validKey ? "valid-minimal-under-declared-domain-rule" : "invalid-or-non-minimal",
    operation: validOperation ? fixture.validOperation : fixture.invalidOperation,
    constraintOutcome: phase === "verify-relationship" ? validKey && validOperation ? "accepted-valid-key-and-reference-exist" : !validKey ? "rejected-key-proposal-invalid-or-non-minimal-no-committed-mutation" : "rejected-orphan-reference-no-committed-mutation" : "not-revealed",
    committed: phase === "verify-relationship" && validKey && validOperation,
    indexControlsIntegrity: false,
    evidence: phase === "verify-relationship" ? [fixture.cardinality, ...fixture.domainRules, fixture.indexEffect] : [],
    reveal,
  };
}

export function l45KeyRelationFrames(schemaFixture: L45SchemaFixture, keyChoice: L45KeyChoice, recordOperation: L45RecordOperation): readonly ModelFrame<L45State>[] {
  return L45_FRAMES.map((id, index) => ({ id, state: buildL45KeyRelationState(schemaFixture, keyChoice, recordOperation, id), activeIds: index === 0 ? ["schema", "provenance"] : index === 1 ? ["key", "rule"] : index === 2 ? ["operation", "reference", "provenance"] : ["constraint", "cardinality", "index"], ticket: `K${index + 1}` }));
}

export const L46_DATASETS = Object.freeze(["club_member_contacts", "order_product_lines", "course_class_teacher"] as const);
export const L46_DEPENDENCY_CHOICES = Object.freeze(["correct_declared_set", "incorrect_diagnosis"] as const);
export const L46_FRAMES = Object.freeze(["declare-dependencies", "reach-1nf", "reach-2nf", "reach-3nf", "verify-lossless-links"] as const);
export type L46Dataset = typeof L46_DATASETS[number];
export type L46DependencyChoice = typeof L46_DEPENDENCY_CHOICES[number];
export type L46Frame = typeof L46_FRAMES[number];

type L46Fixture = Readonly<{
  provenanceTag: string;
  sourceFacts: readonly string[];
  functionalDependencies: readonly string[];
  issue: string;
  relationsByPhase: Readonly<Record<L46Frame, readonly Relation[]>>;
  primaryKeys: readonly string[];
  foreignKeys: readonly string[];
  anomalyEvidence: readonly string[];
}>;

const relation = (name: string, columns: readonly string[], rows: readonly Row[]): Relation => ({ name, columns, rows });
const L46_FIXTURES: Readonly<Record<L46Dataset, L46Fixture>> = {
  club_member_contacts: {
    provenanceTag: "N03",
    sourceFacts: ["M03-belongs-to-robotics", "M03-contact-0790", "M03-contact-0791"],
    functionalDependencies: ["MemberID->MemberName", "MemberID->ClubID", "MemberID-has-multiple-contact-values"],
    issue: "repeating-contact-group-violates-1NF",
    relationsByPhase: {
      "declare-dependencies": [relation("ClubMember_UNF", ["MemberID", "Name", "ClubID", "Contacts"], [{ MemberID: "M03", Name: "Linh", ClubID: "ROB", Contacts: "0790|0791" }])],
      "reach-1nf": [relation("Member", ["MemberID", "Name", "ClubID"], [{ MemberID: "M03", Name: "Linh", ClubID: "ROB" }]), relation("MemberContact", ["MemberID", "Contact"], [{ MemberID: "M03", Contact: "0790" }, { MemberID: "M03", Contact: "0791" }])],
      "reach-2nf": [relation("Member", ["MemberID", "Name", "ClubID"], [{ MemberID: "M03", Name: "Linh", ClubID: "ROB" }]), relation("MemberContact", ["MemberID", "Contact"], [{ MemberID: "M03", Contact: "0790" }, { MemberID: "M03", Contact: "0791" }])],
      "reach-3nf": [relation("Member", ["MemberID", "Name", "ClubID"], [{ MemberID: "M03", Name: "Linh", ClubID: "ROB" }]), relation("MemberContact", ["MemberID", "Contact"], [{ MemberID: "M03", Contact: "0790" }, { MemberID: "M03", Contact: "0791" }])],
      "verify-lossless-links": [relation("Member", ["MemberID", "Name", "ClubID"], [{ MemberID: "M03", Name: "Linh", ClubID: "ROB" }]), relation("MemberContact", ["MemberID", "Contact"], [{ MemberID: "M03", Contact: "0790" }, { MemberID: "M03", Contact: "0791" }])],
    },
    primaryKeys: ["Member.MemberID", "MemberContact.(MemberID,Contact)"],
    foreignKeys: ["MemberContact.MemberID->Member.MemberID"],
    anomalyEvidence: ["contacts-are-atomic-after-1NF", "2NF-and-3NF-already-satisfied-for-the-declared-dependencies"],
  },
  order_product_lines: {
    provenanceTag: "N14",
    sourceFacts: ["O14-has-P2-quantity-2", "O14-has-P7-quantity-1", "P2-price-12.50", "P7-price-8.00"],
    functionalDependencies: ["OrderID->OrderDate", "ProductID->ProductName,UnitPrice", "(OrderID,ProductID)->Quantity"],
    issue: "partial-dependencies-on-composite-key-violate-2NF",
    relationsByPhase: {
      "declare-dependencies": [relation("OrderLine_1NF", ["OrderID", "OrderDate", "ProductID", "ProductName", "UnitPrice", "Quantity"], [{ OrderID: "O14", OrderDate: "2026-05-14", ProductID: "P2", ProductName: "Cable", UnitPrice: 12.5, Quantity: 2 }, { OrderID: "O14", OrderDate: "2026-05-14", ProductID: "P7", ProductName: "Stand", UnitPrice: 8, Quantity: 1 }])],
      "reach-1nf": [relation("OrderLine_1NF", ["OrderID", "OrderDate", "ProductID", "ProductName", "UnitPrice", "Quantity"], [{ OrderID: "O14", OrderDate: "2026-05-14", ProductID: "P2", ProductName: "Cable", UnitPrice: 12.5, Quantity: 2 }, { OrderID: "O14", OrderDate: "2026-05-14", ProductID: "P7", ProductName: "Stand", UnitPrice: 8, Quantity: 1 }])],
      "reach-2nf": [relation("Order", ["OrderID", "OrderDate"], [{ OrderID: "O14", OrderDate: "2026-05-14" }]), relation("Product", ["ProductID", "ProductName", "UnitPrice"], [{ ProductID: "P2", ProductName: "Cable", UnitPrice: 12.5 }, { ProductID: "P7", ProductName: "Stand", UnitPrice: 8 }]), relation("OrderLine", ["OrderID", "ProductID", "Quantity"], [{ OrderID: "O14", ProductID: "P2", Quantity: 2 }, { OrderID: "O14", ProductID: "P7", Quantity: 1 }])],
      "reach-3nf": [relation("Order", ["OrderID", "OrderDate"], [{ OrderID: "O14", OrderDate: "2026-05-14" }]), relation("Product", ["ProductID", "ProductName", "UnitPrice"], [{ ProductID: "P2", ProductName: "Cable", UnitPrice: 12.5 }, { ProductID: "P7", ProductName: "Stand", UnitPrice: 8 }]), relation("OrderLine", ["OrderID", "ProductID", "Quantity"], [{ OrderID: "O14", ProductID: "P2", Quantity: 2 }, { OrderID: "O14", ProductID: "P7", Quantity: 1 }])],
      "verify-lossless-links": [relation("Order", ["OrderID", "OrderDate"], [{ OrderID: "O14", OrderDate: "2026-05-14" }]), relation("Product", ["ProductID", "ProductName", "UnitPrice"], [{ ProductID: "P2", ProductName: "Cable", UnitPrice: 12.5 }, { ProductID: "P7", ProductName: "Stand", UnitPrice: 8 }]), relation("OrderLine", ["OrderID", "ProductID", "Quantity"], [{ OrderID: "O14", ProductID: "P2", Quantity: 2 }, { OrderID: "O14", ProductID: "P7", Quantity: 1 }])],
    },
    primaryKeys: ["Order.OrderID", "Product.ProductID", "OrderLine.(OrderID,ProductID)"],
    foreignKeys: ["OrderLine.OrderID->Order.OrderID", "OrderLine.ProductID->Product.ProductID"],
    anomalyEvidence: ["order-and-product-facts-are-not-repeated-per-line", "3NF-already-satisfied-after-removing-partial-dependencies"],
  },
  course_class_teacher: {
    provenanceTag: "N27",
    sourceFacts: ["S27-in-Class-C2", "Class-C2-taught-by-T04", "T04-is-Ms-Rao", "Class-C2-subject-Science"],
    functionalDependencies: ["StudentID->StudentName,ClassID", "ClassID->TeacherID,SubjectID", "TeacherID->TeacherName", "SubjectID->SubjectName"],
    issue: "transitive-dependencies-via-ClassID-TeacherID-and-SubjectID-violate-3NF",
    relationsByPhase: {
      "declare-dependencies": [relation("StudentClass", ["StudentID", "StudentName", "ClassID", "TeacherID", "TeacherName", "SubjectID", "SubjectName"], [{ StudentID: "S27", StudentName: "Mai", ClassID: "C2", TeacherID: "T04", TeacherName: "Ms Rao", SubjectID: "SCI", SubjectName: "Science" }])],
      "reach-1nf": [relation("StudentClass", ["StudentID", "StudentName", "ClassID", "TeacherID", "TeacherName", "SubjectID", "SubjectName"], [{ StudentID: "S27", StudentName: "Mai", ClassID: "C2", TeacherID: "T04", TeacherName: "Ms Rao", SubjectID: "SCI", SubjectName: "Science" }])],
      "reach-2nf": [relation("StudentClass", ["StudentID", "StudentName", "ClassID", "TeacherID", "TeacherName", "SubjectID", "SubjectName"], [{ StudentID: "S27", StudentName: "Mai", ClassID: "C2", TeacherID: "T04", TeacherName: "Ms Rao", SubjectID: "SCI", SubjectName: "Science" }])],
      "reach-3nf": [relation("Student", ["StudentID", "StudentName", "ClassID"], [{ StudentID: "S27", StudentName: "Mai", ClassID: "C2" }]), relation("Class", ["ClassID", "TeacherID", "SubjectID"], [{ ClassID: "C2", TeacherID: "T04", SubjectID: "SCI" }]), relation("Teacher", ["TeacherID", "TeacherName"], [{ TeacherID: "T04", TeacherName: "Ms Rao" }]), relation("Subject", ["SubjectID", "SubjectName"], [{ SubjectID: "SCI", SubjectName: "Science" }])],
      "verify-lossless-links": [relation("Student", ["StudentID", "StudentName", "ClassID"], [{ StudentID: "S27", StudentName: "Mai", ClassID: "C2" }]), relation("Class", ["ClassID", "TeacherID", "SubjectID"], [{ ClassID: "C2", TeacherID: "T04", SubjectID: "SCI" }]), relation("Teacher", ["TeacherID", "TeacherName"], [{ TeacherID: "T04", TeacherName: "Ms Rao" }]), relation("Subject", ["SubjectID", "SubjectName"], [{ SubjectID: "SCI", SubjectName: "Science" }])],
    },
    primaryKeys: ["Student.StudentID", "Class.ClassID", "Teacher.TeacherID", "Subject.SubjectID"],
    foreignKeys: ["Student.ClassID->Class.ClassID", "Class.TeacherID->Teacher.TeacherID", "Class.SubjectID->Subject.SubjectID"],
    anomalyEvidence: ["TeacherID-is-unique", "Subject-SCI-is-consistently-Science", "Student.ClassID-is-retained"],
  },
};

export type L46State = Readonly<{
  dataset: L46Dataset;
  dependencyChoice: L46DependencyChoice;
  phase: L46Frame;
  provenanceTag: string;
  sourceFacts: readonly string[];
  functionalDependencies: readonly string[];
  diagnosis: string;
  normalForm: string;
  relations: readonly Relation[];
  primaryKeys: readonly string[];
  foreignKeys: readonly string[];
  provenanceMap: readonly string[];
  reconstructedFacts: readonly string[];
  anomalyEvidence: readonly string[];
  teacherIdsUnique: true;
  subjectRowsConsistent: true;
  classIdRetainedWhenRequired: true;
  reveal: Chapter8RevealMap;
}>;

export function buildL46NormalisationState(dataset: L46Dataset, dependencyChoice: L46DependencyChoice, phase: L46Frame): L46State {
  const fixture = L46_FIXTURES[dataset];
  const normalForm = phase === "declare-dependencies" ? "source-declared" : phase === "reach-1nf" ? "1NF" : phase === "reach-2nf" ? "2NF" : "3NF";
  const preFinalKeys = dataset === "order_product_lines"
    ? ["OrderLine_1NF.(OrderID,ProductID)"]
    : dataset === "course_class_teacher"
      ? ["StudentClass.StudentID"]
      : [...fixture.primaryKeys];
  const primaryKeys = phase === "declare-dependencies"
    ? []
    : phase === "reach-1nf" || (dataset === "course_class_teacher" && phase === "reach-2nf")
      ? preFinalKeys
      : [...fixture.primaryKeys];
  const foreignKeys = phase === "declare-dependencies"
    ? []
    : dataset === "club_member_contacts"
      ? [...fixture.foreignKeys]
      : phase === "reach-1nf" || (dataset === "course_class_teacher" && phase === "reach-2nf")
        ? []
        : [...fixture.foreignKeys];
  const reveal = phase === "declare-dependencies"
    ? revealMap(`${dataset}:declared-source-facts`, "dependencies-declared", "diagnosis-verdict-not-revealed", ["functionalDependencies"], ["relations"])
    : phase === "reach-1nf"
      ? revealMap(`${dataset}:declared-source-facts`, "remove-repeating-groups", "1NF", ["functionalDependencies", "diagnosis", "normalForm", "provenanceMap"], ["relations"])
      : phase === "reach-2nf"
        ? revealMap(`${dataset}:declared-source-facts`, "remove-partial-dependencies-or-record-already-satisfied", "2NF", ["functionalDependencies", "diagnosis", "normalForm", "provenanceMap", "primaryKeys", "foreignKeys"], ["relations"])
        : phase === "reach-3nf"
          ? revealMap(`${dataset}:declared-source-facts`, "remove-transitive-dependencies-or-record-already-satisfied", "3NF", ["functionalDependencies", "diagnosis", "normalForm", "provenanceMap", "primaryKeys", "foreignKeys"], ["relations"])
          : revealMap(`${dataset}:declared-source-facts`, "reconstruct-through-declared-PK-FK-links", "all-source-facts-reconstructed", ["functionalDependencies", "diagnosis", "normalForm", "provenanceMap", "primaryKeys", "foreignKeys", "reconstructedFacts", "anomalyEvidence"], ["relations"]);
  return {
    dataset,
    dependencyChoice,
    phase,
    provenanceTag: fixture.provenanceTag,
    sourceFacts: [...fixture.sourceFacts],
    functionalDependencies: [...fixture.functionalDependencies],
    diagnosis: dependencyChoice === "correct_declared_set" ? fixture.issue : `incorrect-diagnosis-does-not-match-declared-dependencies:${fixture.issue}`,
    normalForm,
    relations: fixture.relationsByPhase[phase],
    primaryKeys,
    foreignKeys,
    provenanceMap: fixture.sourceFacts.map((fact) => `${fixture.provenanceTag}:${fact}`),
    reconstructedFacts: phase === "verify-lossless-links" ? [...fixture.sourceFacts] : [],
    anomalyEvidence: phase === "verify-lossless-links" ? [...fixture.anomalyEvidence] : [],
    teacherIdsUnique: true,
    subjectRowsConsistent: true,
    classIdRetainedWhenRequired: true,
    reveal,
  };
}

export function l46NormalisationFrames(dataset: L46Dataset, dependencyChoice: L46DependencyChoice): readonly ModelFrame<L46State>[] {
  return L46_FRAMES.map((id, index) => ({ id, state: buildL46NormalisationState(dataset, dependencyChoice, id), activeIds: index === 0 ? ["dependency", "provenance"] : index < 4 ? ["relation", "key", "provenance"] : ["reconstruction", "evidence", "provenance"], ticket: `N${index + 1}` }));
}

export const L47_PACKETS = Object.freeze(["developer_schema_change", "developer_complex_query", "dba_role_access", "dba_integrity_constraint", "dba_backup_restore_test", "authorised_analyst_query"] as const);
export const L47_FRAMES = Object.freeze(["inspect-request", "route-responsibility", "invoke-dbms-tool", "verify-control"] as const);
export type L47Packet = typeof L47_PACKETS[number];
export type L47Frame = typeof L47_FRAMES[number];

const L47_FIXTURES: Readonly<Record<L47Packet, Readonly<{ role: string; request: string; protectedAsset: string; dictionaryEntry: string; logicalSchemaEffect: string; tool: string; integrityControl: string; securityControl: string; backupEvidence: string; result: string; limitation: string }>>> = {
  developer_schema_change: { role: "database-developer", request: "add-Booking.Status-VARCHAR(16)", protectedAsset: "booking-logical-schema", dictionaryEntry: "Booking.Status-type-VARCHAR(16)-validation-active-or-cancelled", logicalSchemaEffect: "Booking-gains-Status-attribute", tool: "developer-interface", integrityControl: "declared-type-and-status-validation", securityControl: "developer-role-may-alter-schema", backupEvidence: "not-the-control-for-this-request", result: "schema-change-defined-and-recorded", limitation: "interface-submits-the-change-query-processor-applies-it-the-demo-is-not-a-physical-engine" },
  developer_complex_query: { role: "database-developer", request: "test-two-table-booking-summary-query", protectedAsset: "booking-and-event-data", dictionaryEntry: "join-keys-and-field-types-inspected", logicalSchemaEffect: "no-schema-change", tool: "query-processor", integrityControl: "query-references-declared-fields-and-key-link", securityControl: "developer-has-test-data-read-right", backupEvidence: "not-the-control-for-this-request", result: "query-interpreted-executed-and-result-returned", limitation: "logical-tool-responsibility-not-a-physical-query-plan" },
  dba_role_access: { role: "database-administrator", request: "grant-analyst-read-only-booking-access", protectedAsset: "booking-records", dictionaryEntry: "role-and-object-metadata-inspected", logicalSchemaEffect: "no-logical-schema-change", tool: "access-rights-control", integrityControl: "permission-does-not-prove-values-correct", securityControl: "analyst-read-allowed-write-denied", backupEvidence: "not-the-control-for-this-request", result: "least-privilege-rights-applied", limitation: "access-rights-reduce-unauthorised-actions-but-do-not-prevent-every-breach" },
  dba_integrity_constraint: { role: "database-administrator", request: "require-every-booking-to-reference-an-event", protectedAsset: "Booking.EventID", dictionaryEntry: "foreign-key-and-reference-metadata-recorded", logicalSchemaEffect: "Booking.EventID-references-Event.EventID", tool: "integrity-constraint-control", integrityControl: "orphan-event-reference-rejected", securityControl: "access-rights-remain-separate", backupEvidence: "not-the-control-for-this-request", result: "referential-integrity-rule-active", limitation: "matching-reference-does-not-prove-every-business-value-factually-correct" },
  dba_backup_restore_test: { role: "database-administrator", request: "prove-the-nightly-backup-can-be-restored", protectedAsset: "booking-database", dictionaryEntry: "schema-version-and-backup-set-recorded", logicalSchemaEffect: "restored-copy-matches-recorded-schema-version", tool: "backup-and-restore-control", integrityControl: "restore-check-compares-expected-record-count-and-keys", securityControl: "backup-access-restricted", backupEvidence: "isolated-restore-completed-and-verified", result: "recoverability-demonstrated-for-this-tested-backup", limitation: "creating-a-backup-alone-does-not-prove-recoverability-or-prevent-the-original-incident" },
  authorised_analyst_query: { role: "authorised-analyst", request: "read-event-capacity-summary", protectedAsset: "approved-event-fields", dictionaryEntry: "visible-field-definitions-inspected", logicalSchemaEffect: "no-schema-change", tool: "query-processor", integrityControl: "aggregate-derived-from-declared-rows", securityControl: "read-limited-to-approved-fields", backupEvidence: "not-the-control-for-this-request", result: "authorised-summary-returned-without-write", limitation: "authorisation-does-not-prove-the-result-is-factually-complete-beyond-the-source-data" },
};

export type L47State = Readonly<{ packet: L47Packet; phase: L47Frame; provenanceTag: string; role: string; request: string; protectedAsset: string; dictionaryEntry: string; logicalSchemaEffect: string; tool: string; integrityControl: string; securityControl: string; backupEvidence: string; result: string; limitation: string; revealedResponsibility: string; revealedTool: string; revealedEvidence: readonly string[]; reveal: Chapter8RevealMap }>;
export function buildL47DbmsControlState(packet: L47Packet, phase: L47Frame): L47State {
  const facts = L47_FIXTURES[packet];
  const reveal = phase === "inspect-request"
    ? revealMap(`${facts.role}:${facts.request}`, "responsibility-not-revealed", "control-evidence-not-revealed", ["protectedAsset"])
    : phase === "route-responsibility"
      ? revealMap(`${facts.role}:${facts.request}`, facts.role, "tool-and-control-not-revealed", ["protectedAsset", "role"])
      : phase === "invoke-dbms-tool"
        ? revealMap(`${facts.role}:${facts.request}`, facts.tool, "verification-not-yet-complete", ["protectedAsset", "role", "tool", "dictionaryEntry", "logicalSchemaEffect", "integrityControl", "securityControl", "backupEvidence"])
        : revealMap(`${facts.role}:${facts.request}`, facts.tool, facts.result, ["protectedAsset", "role", "tool", "dictionaryEntry", "logicalSchemaEffect", "integrityControl", "securityControl", "backupEvidence", "result", "limitation"]);
  return { packet, phase, provenanceTag: `D${String(L47_PACKETS.indexOf(packet) + 1).padStart(2, "0")}`, ...facts, revealedResponsibility: phase === "inspect-request" ? "not-revealed" : facts.role, revealedTool: phase === "inspect-request" || phase === "route-responsibility" ? "not-revealed" : facts.tool, revealedEvidence: phase === "verify-control" ? [facts.result, facts.limitation] : [], reveal };
}
export function l47DbmsControlFrames(packet: L47Packet): readonly ModelFrame<L47State>[] { return L47_FRAMES.map((id, index) => ({ id, state: buildL47DbmsControlState(packet, id), activeIds: index === 0 ? ["request", "provenance"] : index === 1 ? ["role", "boundary"] : index === 2 ? ["tool", "control", "provenance"] : ["evidence", "limitation"], ticket: `D${index + 1}` })); }

export const L48_STATEMENT_FIXTURES = Object.freeze(["create_database", "create_table", "alter_table", "select_where", "inner_join", "insert_row", "update_where", "delete_where"] as const);
export const L48_FRAMES = Object.freeze(["read-statement", "predict-language-role", "trace-target", "verify-effect"] as const);
export type L48StatementFixture = typeof L48_STATEMENT_FIXTURES[number];
export type L48Frame = typeof L48_FRAMES[number];
type L48Facts = Readonly<{ statement: string; languageRole: "DDL" | "DML"; targetKind: string; targetName: string; matchedRows: readonly string[]; structureBefore: readonly string[]; structureAfter: readonly string[]; rowsBefore: readonly Row[]; rowsAfter: readonly Row[]; result: readonly Row[]; evidence: string; limitation: string }>;
const BASE_ROWS: readonly Row[] = [{ BookingID: "B1", EventID: "E1", Seats: 2 }, { BookingID: "B2", EventID: "E2", Seats: 4 }];
const L48_FIXTURES: Readonly<Record<L48StatementFixture, L48Facts>> = {
  create_database: { statement: "CREATE DATABASE EventHub;", languageRole: "DDL", targetKind: "database-structure", targetName: "EventHub", matchedRows: [], structureBefore: [], structureAfter: ["database:EventHub"], rowsBefore: [], rowsAfter: [], result: [], evidence: "creates-a-database-container-in-the-declared-teaching-dialect", limitation: "CREATE-DATABASE-support-and-syntax-vary-by-DBMS" },
  create_table: { statement: "CREATE TABLE Event (EventID CHARACTER(3), Title VARCHAR(40), PRIMARY KEY (EventID));", languageRole: "DDL", targetKind: "table-structure", targetName: "Event", matchedRows: [], structureBefore: ["database:EventHub"], structureAfter: ["database:EventHub", "table:Event(EventID,Title)", "PK:Event.EventID"], rowsBefore: [], rowsAfter: [], result: [], evidence: "creates-table-columns-types-and-primary-key", limitation: "this-is-the-declared-9618-teaching-subset" },
  alter_table: { statement: "ALTER TABLE Event ADD StartDate DATE;", languageRole: "DDL", targetKind: "table-structure", targetName: "Event", matchedRows: [], structureBefore: ["Event(EventID,Title)"], structureAfter: ["Event(EventID,Title,StartDate)"], rowsBefore: [], rowsAfter: [], result: [], evidence: "adds-one-declared-column-to-the-table-structure", limitation: "existing-value-handling-can-vary-by-DBMS" },
  select_where: { statement: "SELECT BookingID, Seats FROM Booking WHERE Seats >= 4;", languageRole: "DML", targetKind: "query-result", targetName: "Booking", matchedRows: ["B2"], structureBefore: ["Booking(BookingID,EventID,Seats)"], structureAfter: ["Booking(BookingID,EventID,Seats)"], rowsBefore: BASE_ROWS, rowsAfter: BASE_ROWS, result: [{ BookingID: "B2", Seats: 4 }], evidence: "filters-then-projects-without-mutating-source-rows", limitation: "logical-teaching-trace-not-a-physical-execution-plan" },
  inner_join: { statement: "SELECT Booking.BookingID, Event.Title FROM Booking INNER JOIN Event ON Booking.EventID = Event.EventID;", languageRole: "DML", targetKind: "query-result", targetName: "Booking+Event", matchedRows: ["B1:E1", "B2:E2"], structureBefore: ["Booking(BookingID,EventID,Seats)", "Event(EventID,Title)"], structureAfter: ["Booking(BookingID,EventID,Seats)", "Event(EventID,Title)"], rowsBefore: BASE_ROWS, rowsAfter: BASE_ROWS, result: [{ BookingID: "B1", Title: "Robotics" }, { BookingID: "B2", Title: "Networks" }], evidence: "joins-at-most-two-tables-on-the-declared-key-link", limitation: "logical-teaching-trace-not-an-optimizer-plan" },
  insert_row: { statement: "INSERT INTO Booking VALUES ('B3', 'E1', 1);", languageRole: "DML", targetKind: "stored-rows", targetName: "Booking", matchedRows: ["B3"], structureBefore: ["Booking(BookingID,EventID,Seats)"], structureAfter: ["Booking(BookingID,EventID,Seats)"], rowsBefore: BASE_ROWS, rowsAfter: [...BASE_ROWS, { BookingID: "B3", EventID: "E1", Seats: 1 }], result: [], evidence: "inserts-one-row-with-quoted-text-values", limitation: "the-referenced-event-is-declared-to-exist-in-this-fixture" },
  update_where: { statement: "UPDATE Booking SET Seats = 3 WHERE BookingID = 'B1';", languageRole: "DML", targetKind: "stored-rows", targetName: "Booking", matchedRows: ["B1"], structureBefore: ["Booking(BookingID,EventID,Seats)"], structureAfter: ["Booking(BookingID,EventID,Seats)"], rowsBefore: BASE_ROWS, rowsAfter: [{ BookingID: "B1", EventID: "E1", Seats: 3 }, BASE_ROWS[1]], result: [], evidence: "updates-only-the-row-matched-by-the-quoted-identifier", limitation: "constraint-and-transaction-details-are-outside-this-finite-trace" },
  delete_where: { statement: "DELETE FROM Booking WHERE BookingID = 'B2';", languageRole: "DML", targetKind: "stored-rows", targetName: "Booking", matchedRows: ["B2"], structureBefore: ["Booking(BookingID,EventID,Seats)"], structureAfter: ["Booking(BookingID,EventID,Seats)"], rowsBefore: BASE_ROWS, rowsAfter: [BASE_ROWS[0]], result: [], evidence: "deletes-only-the-matching-row-and-preserves-the-table-schema", limitation: "DELETE-is-not-DROP-TABLE" },
};
export type L48State = L48Facts & Readonly<{ statementFixture: L48StatementFixture; phase: L48Frame; provenanceTag: string; dialect: string; revealedLanguageRole: string; revealedTarget: string; revealedEffect: string; reveal: Chapter8RevealMap }>;
export function buildL48SqlRoleState(statementFixture: L48StatementFixture, phase: L48Frame): L48State {
  const facts = L48_FIXTURES[statementFixture];
  const reveal = phase === "read-statement"
    ? revealMap(facts.statement, "language-role-not-revealed", "effect-not-revealed", ["dialect"], facts.rowsBefore.length ? ["rowsBefore"] : [])
    : phase === "predict-language-role"
      ? revealMap(facts.statement, facts.languageRole, "target-and-effect-not-revealed", ["dialect", "languageRole"], facts.rowsBefore.length ? ["rowsBefore"] : [])
      : phase === "trace-target"
        ? revealMap(facts.statement, `${facts.languageRole}:${facts.targetKind}:${facts.targetName}`, "effect-not-revealed", ["dialect", "languageRole", "target", "matchedRows", "structureBefore"], facts.rowsBefore.length ? ["rowsBefore"] : [])
        : revealMap(facts.statement, `${facts.languageRole}:${facts.targetKind}:${facts.targetName}`, facts.evidence, ["dialect", "languageRole", "target", "matchedRows", "structureBefore", "structureAfter", "evidence", "limitation"], ["rowsBefore", ...(facts.result.length ? ["result"] : []), ...(facts.rowsAfter.length ? ["rowsAfter"] : [])]);
  return { statementFixture, phase, provenanceTag: `Q${String(L48_STATEMENT_FIXTURES.indexOf(statementFixture) + 1).padStart(2, "0")}`, dialect: "Cambridge-9618-declared-teaching-subset-SQL-dialects-vary", ...facts, revealedLanguageRole: phase === "read-statement" ? "not-revealed" : facts.languageRole, revealedTarget: phase === "trace-target" || phase === "verify-effect" ? `${facts.targetKind}:${facts.targetName}` : "not-revealed", revealedEffect: phase === "verify-effect" ? facts.evidence : "not-revealed", reveal };
}
export function l48SqlRoleFrames(statementFixture: L48StatementFixture): readonly ModelFrame<L48State>[] { return L48_FRAMES.map((id, index) => ({ id, state: buildL48SqlRoleState(statementFixture, id), activeIds: index === 0 ? ["statement", "provenance"] : index === 1 ? ["role", "target"] : index === 2 ? ["clause", "target", "provenance"] : ["effect", "limitation"], ticket: `Q${index + 1}` })); }

export const L49_DDL_FAMILIES = Object.freeze(["create_database", "create_table_types", "alter_table", "primary_key", "foreign_key_references"] as const);
export const L49_VALIDITY_VARIANTS = Object.freeze(["valid", "invalid"] as const);
export const L49_FRAMES = Object.freeze(["inspect-requirement", "assemble-ddl", "apply-schema-change", "verify-constraint"] as const);
export type L49DdlFamily = typeof L49_DDL_FAMILIES[number];
export type L49Validity = typeof L49_VALIDITY_VARIANTS[number];
export type L49Frame = typeof L49_FRAMES[number];
type L49Fixture = Readonly<{ requirement: string; validStatement: string; invalidStatement: string; faultRepair: readonly [from: string, to: string]; tokens: readonly string[]; dataTypes: readonly string[]; schemaBefore: readonly string[]; validProspective: readonly string[]; constraintCheck: string; errorReason: string }>;
const ALL_DDL_TYPES = ["CHARACTER", "VARCHAR(n)", "BOOLEAN", "INTEGER", "REAL", "DATE", "TIME"] as const;
const L49_FIXTURES: Readonly<Record<L49DdlFamily, L49Fixture>> = {
  create_database: { requirement: "create-the-EventHub-database", validStatement: "CREATE DATABASE EventHub;", invalidStatement: "CREATE DATABASE;", faultRepair: ["DATABASE", "DATABASE EventHub"], tokens: ["CREATE", "DATABASE", "EventHub"], dataTypes: [], schemaBefore: [], validProspective: ["database:EventHub"], constraintCheck: "database-name-present-and-valid-in-teaching-dialect", errorReason: "missing-database-identifier" },
  create_table_types: { requirement: "create-Schedule-with-all-seven-syllabus-data-types", validStatement: "CREATE TABLE Schedule (Code CHARACTER(4), Title VARCHAR(50), Active BOOLEAN, Places INTEGER, Price REAL, EventDate DATE, StartTime TIME);", invalidStatement: "CREATE TABLE Schedule (Code CHRACTER(4), Title VARCHAR(50), Active BOOLEAN, Places INTEGER, Price REAL, EventDate DATE, StartTime TIME);", faultRepair: ["CHRACTER", "CHARACTER"], tokens: ["CREATE", "TABLE", "column-definitions"], dataTypes: ALL_DDL_TYPES, schemaBefore: ["database:EventHub"], validProspective: ["Schedule(Code,Title,Active,Places,Price,EventDate,StartTime)", ...ALL_DDL_TYPES], constraintCheck: "all-seven-types-spelled-and-assigned-to-compatible-field-purposes", errorReason: "CHRACTER-is-not-the-declared-CHARACTER-type" },
  alter_table: { requirement: "add-Location-VARCHAR(30)-to-Schedule", validStatement: "ALTER TABLE Schedule ADD Location VARCHAR(30);", invalidStatement: "ALTER Schedule ADD Location VARCHAR(30);", faultRepair: ["ALTER Schedule", "ALTER TABLE Schedule"], tokens: ["ALTER", "TABLE", "ADD", "Location", "VARCHAR(30)"], dataTypes: ["VARCHAR(n)"], schemaBefore: ["Schedule(Code,Title)"], validProspective: ["Schedule(Code,Title,Location)"], constraintCheck: "target-table-and-added-column-are-explicit", errorReason: "TABLE-keyword-is-missing" },
  primary_key: { requirement: "declare-Schedule.Code-as-the-primary-key", validStatement: "CREATE TABLE Schedule (Code CHARACTER(4), PRIMARY KEY (Code));", invalidStatement: "CREATE TABLE Schedule (Code CHARACTER(4), PRIMARY KEY Code);", faultRepair: ["PRIMARY KEY Code", "PRIMARY KEY (Code)"], tokens: ["PRIMARY", "KEY", "(Code)"], dataTypes: ["CHARACTER"], schemaBefore: ["database:EventHub"], validProspective: ["Schedule(Code)", "PK:Schedule.Code"], constraintCheck: "primary-key-field-list-uses-parentheses-and-identifies-the-declared-column", errorReason: "PRIMARY-KEY-field-list-must-use-parentheses-in-the-declared-teaching-subset" },
  foreign_key_references: { requirement: "link-Booking.EventID-to-Event.EventID", validStatement: "CREATE TABLE Booking (BookingID CHARACTER(3), EventID CHARACTER(3), PRIMARY KEY (BookingID), FOREIGN KEY (EventID) REFERENCES Event (EventID));", invalidStatement: "CREATE TABLE Booking (BookingID CHARACTER(3), EventID INTEGER, PRIMARY KEY (BookingID), FOREIGN KEY (EventID) REFERENCES Event (EventID));", faultRepair: ["EventID INTEGER", "EventID CHARACTER(3)"], tokens: ["FOREIGN", "KEY", "(EventID)", "REFERENCES", "Event", "(EventID)"], dataTypes: ["CHARACTER", "INTEGER"], schemaBefore: ["Event.EventID:CHARACTER(3):PRIMARY-KEY"], validProspective: ["Booking(BookingID,EventID)", "FK:Booking.EventID->Event.EventID"], constraintCheck: "referenced-table-and-key-exist-and-declared-types-are-compatible", errorReason: "foreign-and-referenced-key-types-are-incompatible" },
};
export function assertL49SingleFaultFixtures(): true {
  for (const family of L49_DDL_FAMILIES) {
    const fixture = L49_FIXTURES[family];
    const [from, to] = fixture.faultRepair;
    const occurrences = fixture.invalidStatement.split(from).length - 1;
    if (occurrences !== 1 || fixture.invalidStatement.replace(from, to) !== fixture.validStatement) {
      throw new Error(`L49 fixture ${family} must differ from its valid statement by exactly one declared repair.`);
    }
  }
  return true;
}
assertL49SingleFaultFixtures();
export type L49State = Readonly<{ ddlFamily: L49DdlFamily; validityVariant: L49Validity; phase: L49Frame; provenanceTag: string; requirement: string; statement: string; faultRepair: readonly [from: string, to: string]; tokens: readonly string[]; dataTypes: readonly string[]; schemaBefore: readonly string[]; prospectiveSchema: readonly string[]; constraintCheck: string; schemaAfter: readonly string[]; errorReason: string; declaredFaults: readonly string[]; dialect: string; valid: boolean; reveal: Chapter8RevealMap }>;
export function buildL49DdlSchemaState(ddlFamily: L49DdlFamily, validityVariant: L49Validity, phase: L49Frame): L49State {
  const fixture = L49_FIXTURES[ddlFamily];
  const valid = validityVariant === "valid";
  const statement = valid ? fixture.validStatement : fixture.invalidStatement;
  const schemaBefore = [...fixture.schemaBefore];
  const reveal = phase === "inspect-requirement"
    ? revealMap(`${fixture.requirement}:${schemaBefore.join("|")}`, "statement-not-assembled", "validity-not-revealed", ["schemaBefore"])
    : phase === "assemble-ddl"
      ? revealMap(`${fixture.requirement}:${schemaBefore.join("|")}`, statement, "validity-not-revealed", ["schemaBefore", "tokens", "dataTypes"])
      : phase === "apply-schema-change"
        ? revealMap(`${fixture.requirement}:${schemaBefore.join("|")}`, statement, "prospective-change-only", ["schemaBefore", "tokens", "dataTypes", "prospectiveSchema"])
        : revealMap(`${fixture.requirement}:${schemaBefore.join("|")}`, statement, valid ? "schema-change-committed" : `rejected:${fixture.errorReason}`, ["schemaBefore", "tokens", "dataTypes", "prospectiveSchema", "constraintCheck", "schemaAfter", "errorReason", "declaredFaults", "dialect"]);
  return {
    ddlFamily,
    validityVariant,
    phase,
    provenanceTag: `S${String(L49_DDL_FAMILIES.indexOf(ddlFamily) + 1).padStart(2, "0")}`,
    requirement: fixture.requirement,
    statement,
    faultRepair: fixture.faultRepair,
    tokens: phase === "inspect-requirement" ? [] : [...fixture.tokens],
    dataTypes: [...fixture.dataTypes],
    schemaBefore,
    prospectiveSchema: phase === "apply-schema-change" || phase === "verify-constraint" ? valid ? [...fixture.validProspective] : [...schemaBefore] : [],
    constraintCheck: phase === "verify-constraint" ? fixture.constraintCheck : "not-revealed",
    schemaAfter: phase === "verify-constraint" && valid ? [...fixture.validProspective] : [...schemaBefore],
    errorReason: phase === "verify-constraint" && !valid ? fixture.errorReason : "none",
    declaredFaults: valid ? [] : [fixture.errorReason],
    dialect: "Cambridge-9618-declared-teaching-subset-not-a-universal-vendor-validator",
    valid,
    reveal,
  };
}
export function l49DdlSchemaFrames(ddlFamily: L49DdlFamily, validityVariant: L49Validity): readonly ModelFrame<L49State>[] { return L49_FRAMES.map((id, index) => ({ id, state: buildL49DdlSchemaState(ddlFamily, validityVariant, id), activeIds: index === 0 ? ["requirement", "provenance"] : index === 1 ? ["tokens", "statement"] : index === 2 ? ["prospective", "provenance"] : ["constraint", "result", "limitation"], ticket: `S${index + 1}` })); }

export const L50_STATEMENT_PACKETS = Object.freeze(["select_from_where", "order_by", "group_by_count", "sum_avg", "inner_join_two_tables", "insert_full_row", "insert_explicit_columns", "update_where", "delete_where", "delete_without_where"] as const);
export const L50_FRAMES = Object.freeze(["parse", "source", "match", "transform", "result"] as const);
export type L50Packet = typeof L50_STATEMENT_PACKETS[number];
export type L50Frame = typeof L50_FRAMES[number];
type L50Fixture = Readonly<{ statement: string; parameters: readonly string[]; sourceTables: readonly string[]; sourceRows: readonly Row[]; joinPairs: readonly string[]; matchedRowIds: readonly string[]; groupKeys: readonly string[]; aggregateInputs: readonly number[]; projectedColumns: readonly string[]; sortKeys: readonly string[]; affectedRowIds: readonly string[]; resultRows: readonly Row[]; rowsAfter: readonly Row[]; schemaAfter: readonly string[]; evidence: string }>;
const BOOKING_ROWS: readonly Row[] = [{ BookingID: "B1", EventID: "E1", Category: "student", Seats: 2, Price: 10 }, { BookingID: "B2", EventID: "E2", Category: "adult", Seats: 4, Price: 18 }, { BookingID: "B3", EventID: "E1", Category: "student", Seats: 1, Price: 10 }];
const EVENT_ROWS: readonly Row[] = [{ EventID: "E1", Title: "Robotics" }, { EventID: "E2", Title: "Networks" }];
const L50_FIXTURES: Readonly<Record<L50Packet, L50Fixture>> = {
  select_from_where: { statement: "SELECT BookingID, Seats FROM Booking WHERE Seats >= 2;", parameters: ["minimum-seats:2"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B1", "B2"], groupKeys: [], aggregateInputs: [], projectedColumns: ["BookingID", "Seats"], sortKeys: [], affectedRowIds: [], resultRows: [{ BookingID: "B1", Seats: 2 }, { BookingID: "B2", Seats: 4 }], rowsAfter: BOOKING_ROWS, schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "WHERE-matches-B1-and-B2-then-SELECT-projects-two-columns" },
  order_by: { statement: "SELECT BookingID, Seats FROM Booking ORDER BY Seats DESC, BookingID ASC;", parameters: ["stable-tie-order:BookingID-ASC"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B1", "B2", "B3"], groupKeys: [], aggregateInputs: [], projectedColumns: ["BookingID", "Seats"], sortKeys: ["Seats-DESC", "BookingID-ASC"], affectedRowIds: [], resultRows: [{ BookingID: "B2", Seats: 4 }, { BookingID: "B1", Seats: 2 }, { BookingID: "B3", Seats: 1 }], rowsAfter: BOOKING_ROWS, schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "result-rows-ordered-by-declared-keys-source-storage-order-not-promised" },
  group_by_count: { statement: "SELECT Category, COUNT(*) AS BookingCount FROM Booking GROUP BY Category ORDER BY Category ASC;", parameters: ["no-NULL-values-in-core-fixture"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B1", "B2", "B3"], groupKeys: ["adult", "student"], aggregateInputs: [1, 2], projectedColumns: ["Category", "BookingCount"], sortKeys: ["Category-ASC"], affectedRowIds: [], resultRows: [{ Category: "adult", BookingCount: 1 }, { Category: "student", BookingCount: 2 }], rowsAfter: BOOKING_ROWS, schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "COUNT-derived-from-the-displayed-rows-in-each-category" },
  sum_avg: { statement: "SELECT SUM(Seats) AS TotalSeats, AVG(Price) AS AveragePrice FROM Booking;", parameters: ["no-NULL-values-in-core-fixture"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B1", "B2", "B3"], groupKeys: [], aggregateInputs: [2, 4, 1, 10, 18, 10], projectedColumns: ["TotalSeats", "AveragePrice"], sortKeys: [], affectedRowIds: [], resultRows: [{ TotalSeats: 7, AveragePrice: 12.6667 }], rowsAfter: BOOKING_ROWS, schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "SUM-and-AVG-use-only-displayed-inputs-average-rounded-to-four-decimal-places" },
  inner_join_two_tables: { statement: "SELECT Booking.BookingID, Event.Title FROM Booking INNER JOIN Event ON Booking.EventID = Event.EventID ORDER BY Booking.BookingID;", parameters: ["two-table-limit"], sourceTables: ["Booking", "Event"], sourceRows: [...BOOKING_ROWS, ...EVENT_ROWS], joinPairs: ["B1:E1", "B2:E2", "B3:E1"], matchedRowIds: ["B1:E1", "B2:E2", "B3:E1"], groupKeys: [], aggregateInputs: [], projectedColumns: ["BookingID", "Title"], sortKeys: ["BookingID-ASC"], affectedRowIds: [], resultRows: [{ BookingID: "B1", Title: "Robotics" }, { BookingID: "B2", Title: "Networks" }, { BookingID: "B3", Title: "Robotics" }], rowsAfter: BOOKING_ROWS, schemaAfter: ["Booking(...)", "Event(...)"], evidence: "each-result-row-has-an-explicit-two-table-join-pair" },
  insert_full_row: { statement: "INSERT INTO Booking VALUES ('B4', 'E2', 'adult', 2, 18);", parameters: ["referenced-Event-E2-exists"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B4"], groupKeys: [], aggregateInputs: [], projectedColumns: [], sortKeys: [], affectedRowIds: ["B4"], resultRows: [], rowsAfter: [...BOOKING_ROWS, { BookingID: "B4", EventID: "E2", Category: "adult", Seats: 2, Price: 18 }], schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "one-complete-row-inserted-text-values-quoted" },
  insert_explicit_columns: { statement: "INSERT INTO Booking (BookingID, EventID, Category, Seats, Price) VALUES ('B4', 'E2', 'adult', 2, 18);", parameters: ["explicit-column-order"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B4"], groupKeys: [], aggregateInputs: [], projectedColumns: [], sortKeys: [], affectedRowIds: ["B4"], resultRows: [], rowsAfter: [...BOOKING_ROWS, { BookingID: "B4", EventID: "E2", Category: "adult", Seats: 2, Price: 18 }], schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "explicit-column-list-maps-to-values-in-the-same-order" },
  update_where: { statement: "UPDATE Booking SET Seats = 3 WHERE BookingID = 'B1';", parameters: ["target-id:B1"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B1"], groupKeys: [], aggregateInputs: [], projectedColumns: [], sortKeys: [], affectedRowIds: ["B1"], resultRows: [], rowsAfter: [{ ...BOOKING_ROWS[0], Seats: 3 }, BOOKING_ROWS[1], BOOKING_ROWS[2]], schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "only-the-matching-row-is-updated" },
  delete_where: { statement: "DELETE FROM Booking WHERE BookingID = 'B2';", parameters: ["target-id:B2"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B2"], groupKeys: [], aggregateInputs: [], projectedColumns: [], sortKeys: [], affectedRowIds: ["B2"], resultRows: [], rowsAfter: [BOOKING_ROWS[0], BOOKING_ROWS[2]], schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "one-matching-row-deleted-table-structure-preserved" },
  delete_without_where: { statement: "DELETE FROM Booking;", parameters: ["no-WHERE-clause"], sourceTables: ["Booking"], sourceRows: BOOKING_ROWS, joinPairs: [], matchedRowIds: ["B1", "B2", "B3"], groupKeys: [], aggregateInputs: [], projectedColumns: [], sortKeys: [], affectedRowIds: ["B1", "B2", "B3"], resultRows: [], rowsAfter: [], schemaAfter: ["Booking(BookingID,EventID,Category,Seats,Price)"], evidence: "all-rows-deleted-but-the-Booking-table-schema-remains" },
};
export type L50State = L50Fixture & Readonly<{ statementPacket: L50Packet; phase: L50Frame; provenanceTag: string; dialect: string; logicalTeachingOrder: true; hiddenThirdTable: false; revealedMatches: readonly string[]; revealedResultRows: readonly Row[]; revealedRowsAfter: readonly Row[]; reveal: Chapter8RevealMap }>;
export function buildL50DmlTraceState(statementPacket: L50Packet, phase: L50Frame): L50State {
  const facts = L50_FIXTURES[statementPacket];
  const isQuery = facts.resultRows.length > 0;
  const reveal = phase === "parse"
    ? revealMap(facts.statement, "statement-parsed", "source-and-match-not-revealed", ["parameters", "dialect"])
    : phase === "source"
      ? revealMap(facts.statement, `source:${facts.sourceTables.join("+")}`, "match-not-revealed", ["parameters", "dialect", "sourceTables"], ["sourceRows"])
      : phase === "match"
        ? revealMap(facts.statement, `match:${facts.matchedRowIds.join(",")}`, "transform-not-revealed", ["parameters", "dialect", "sourceTables", "joinPairs", "matchedRowIds"], ["sourceRows"])
        : phase === "transform"
          ? revealMap(facts.statement, "project-group-aggregate-sort-or-mutate", isQuery ? "result-projection-ready" : "row-after-state-not-committed", ["parameters", "dialect", "sourceTables", "joinPairs", "matchedRowIds", "groupKeys", "aggregateInputs", "projectedColumns", "sortKeys", "affectedRowIds"], ["sourceRows", ...(isQuery ? ["resultRows"] : [])])
          : revealMap(facts.statement, "commit-or-return-result", isQuery ? "query-result-ready" : `row-after-state:${facts.rowsAfter.length}`, ["parameters", "dialect", "sourceTables", "joinPairs", "matchedRowIds", "groupKeys", "aggregateInputs", "projectedColumns", "sortKeys", "affectedRowIds", "schemaAfter", "evidence"], ["sourceRows", ...(isQuery ? ["resultRows"] : ["rowsAfter"])]);
  return { statementPacket, phase, provenanceTag: `Q${String(L50_STATEMENT_PACKETS.indexOf(statementPacket) + 11).padStart(2, "0")}`, dialect: "Cambridge-9618-logical-teaching-trace-SQL-dialects-and-physical-plans-vary", logicalTeachingOrder: true, hiddenThirdTable: false, ...facts, revealedMatches: phase === "match" || phase === "transform" || phase === "result" ? [...facts.matchedRowIds] : [], revealedResultRows: phase === "transform" || phase === "result" ? immutableRows(facts.resultRows) : [], revealedRowsAfter: phase === "result" ? immutableRows(facts.rowsAfter) : [], reveal };
}
export function l50DmlTraceFrames(statementPacket: L50Packet): readonly ModelFrame<L50State>[] { return L50_FRAMES.map((id, index) => ({ id, state: buildL50DmlTraceState(statementPacket, id), activeIds: index === 0 ? ["statement", "provenance"] : index === 1 ? ["source", "provenance"] : index === 2 ? ["match", "provenance"] : index === 3 ? ["transform", "result", "provenance"] : ["result", "evidence", "limitation"], ticket: `Q${index + 1}` })); }

export const CHAPTER8_MODEL_STATE_COUNTS = Object.freeze({
  "P1-L44": 24,
  "P1-L45": 48,
  "P1-L46": 30,
  "P1-L47": 24,
  "P1-L48": 32,
  "P1-L49": 40,
  "P1-L50": 50,
});
