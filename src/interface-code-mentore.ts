export interface ApiResponse<T> {
  message: string;
  result: boolean;
  data: T;
}

/* Role */
export interface Role {
  roleId: number;
  role: string;
}

/* Designation */
export interface Designation {
  designationId: number;
  designation: string;
}

/* Skill & Experience */
export interface EmployeeSkill {
  empSkillId: number;
  empId: number;
  skill: string;
  totalYearExp: number;
  lastVersionUsed: string;
}

export interface EmployeeExperience {
  empExpId: number;
  empId: number;
  companyName: string;
  startDate?: string;
  endDate?: string;
  designation?: string;
  projectsWorkedOn?: string;
}

/* Employee - shape based on your examples and schema */
export interface Employee {
  role: boolean;
  mobile: string | undefined;
  roleId?: number;
  userName?: string;
  empCode?: string;
  empId?: number;
  empName?: string;
  empEmailId?: string;
  empDesignation?: string;      
  empDesignationId?: number;    
  empContactNo?: string;
  empAltContactNo?: string;
  empPersonalEmailId?: string;
  empExpTotalYear?: number;
  empExpTotalMonth?: number;
  empCity?: string;
  empState?: string;
  empPinCode?: string;
  empAddress?: string;
  empPerCity?: string;
  empPerState?: string;
  empPerPinCode?: string;
  empPerAddress?: string;
  password?: string;
  ErpEmployeeSkills?: EmployeeSkill[];
  ErmEmpExperiences?: EmployeeExperience[];
}
