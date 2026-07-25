export type DepartmentId =
  | "research"
  | "legal"
  | "creative"
  | "business"
  | "media";

export type CompanyId = string;
export type DivisionId = string;
export type TeamId = string;
export type EmployeeId = string;
export type CharacterId = EmployeeId;

export type OrganizationStatus = "Planning" | "Active" | "Paused" | "Archived";
export type EmployeeStatus =
  | "MVP Candidate"
  | "Active"
  | "Draft"
  | "On Leave"
  | "Archived";

export type EmployeeProfileStage = "Approved" | "Rough";
export type EmployeeGender =
  | "Female"
  | "Male"
  | "Non-binary"
  | "Unknown"
  | "Undisclosed";

export type Company = {
  id: CompanyId;
  slug: string;
  nameKo: string;
  nameEn: string;
  description: string;
  descriptionKo: string;
  descriptionEn: string;
  divisionIds: DivisionId[];
  status: OrganizationStatus;
};

export type Division = {
  id: DivisionId;
  companyId: CompanyId;
  slug: string;
  nameKo: string;
  nameEn: string;
  description: string;
  descriptionKo: string;
  descriptionEn: string;
  icon: string;
  displayOrder: number;
  status: OrganizationStatus;
  organizationType: "Division" | "Headquarters";
  teamIds: TeamId[];
  departmentIds: DepartmentId[];
};

export type Team = {
  id: TeamId;
  divisionId: DivisionId;
  slug: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  displayOrder: number;
  status: OrganizationStatus;
};

export type Department = {
  id: DepartmentId;
  name: string;
  mandate: string;
  signal: string;
  roles: string[];
  operatingMode: string;
  accent: string;
  legacyStatus: "Legacy" | "Archived";
  publicVisible: false;
};

export type EmployeeSocialLink = {
  platform: "YouTube" | "Instagram" | "X" | "LinkedIn" | "Website";
  handle?: string;
  url?: string;
  status: "Placeholder" | "Active" | "Archived";
};

export type Employee = {
  id: EmployeeId;
  slug: string;
  name: string;
  nameKo: string;
  nameEn: string;
  employeeCode?: string;
  gender?: EmployeeGender;
  divisionId: DivisionId;
  teamId: TeamId;
  departmentId: DepartmentId;
  jobTitle: string;
  jobTitleKo: string;
  jobTitleEn: string;
  hook: string;
  hookKo: string;
  hookEn: string;
  summary: string;
  summaryKo: string;
  summaryEn: string;
  personality: string;
  values: string[];
  strengths: string[];
  specialties: string[];
  specialtiesKo: string[];
  specialtiesEn: string[];
  weakness: string;
  stance: string;
  contentRole: string;
  confidence: "Exploratory" | "Balanced" | "High";
  status: EmployeeStatus;
  profileStage: EmployeeProfileStage;
  publicVisibility: boolean;
  personaRules: string[];
  allowedTopics: string[];
  prohibitedTopics: string[];
  preferredActivityFormats: string[];
  brandColor: string;
  profileImage: string;
  heroImage: string;
  socialLinks: EmployeeSocialLink[];
};

// Character remains the public IP-facing name used by the Discussion Engine and UI.
export type Character = Employee;

export type EmployeeShowcaseProfile = {
  headline: string;
  headlineKo: string;
  headlineEn: string;
  overview: string;
  overviewKo: string;
  overviewEn: string;
  primaryRole: string;
  primaryRoleKo: string;
  primaryRoleEn: string;
  currentFocus: string;
  currentFocusKo: string;
  currentFocusEn: string;
};

export type EmployeeShowcaseSpecialty = {
  id: string;
  name: string;
  nameKo: string;
  nameEn: string;
  description: string;
  descriptionKo: string;
  descriptionEn: string;
  level: "Core" | "Advanced" | "Working";
  displayOrder: number;
};

export type EmployeeMediaItem = {
  id: string;
  title: string;
  titleKo: string;
  titleEn: string;
  type: "Image" | "Video" | "Audio" | "Document";
  assetId?: string;
  url?: string;
  status: "Placeholder" | "Draft" | "Published" | "Archived";
  publishedAt?: string;
};

export type EmployeeArchiveItem = {
  id: string;
  title: string;
  titleKo: string;
  titleEn: string;
  type: "Discussion" | "Knowledge" | "Content" | "Media" | "Milestone";
  summary: string;
  summaryKo: string;
  summaryEn: string;
  relatedEntityId?: string;
  archivedAt: string;
};

export type EmployeeTimelineEntry = {
  id: string;
  date: string;
  title: string;
  titleKo: string;
  titleEn: string;
  description: string;
  descriptionKo: string;
  descriptionEn: string;
  type: "Joined" | "Role Update" | "Discussion" | "Publication" | "Milestone";
  relatedEntityId?: string;
};

export type EmployeeShowcase = {
  id: string;
  employeeId: EmployeeId;
  profile: EmployeeShowcaseProfile;
  specialties: EmployeeShowcaseSpecialty[];
  recentDiscussionIds: string[];
  knowledgeEntryIds: string[];
  publishedContentIds: string[];
  media: EmployeeMediaItem[];
  archive: EmployeeArchiveItem[];
  timeline: EmployeeTimelineEntry[];
  updatedAt: string;
};
