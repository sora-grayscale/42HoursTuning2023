import { v4 as uuidv4 } from "uuid";
import {
  MatchGroupDetail,
  MatchGroupConfig,
  UserForFilter,
} from "../../model/types";
import {
  getMatchGroupDetailByMatchGroupId,
  getUserIdsBeforeMatched,
  hasSkillNameRecord,
  insertMatchGroup,
} from "./repository";
import { getUserForFilter } from "../users/repository";

export const checkSkillsRegistered = async (
  skillNames: string[]
): Promise<string | undefined> => {
  for (const skillName of skillNames) {
    if (!(await hasSkillNameRecord(skillName))) {
      return skillName;
    }
  }

  return;
};

export const createMatchGroup = async (
  matchGroupConfig: MatchGroupConfig,
  timeout?: number
): Promise<MatchGroupDetail | undefined> => {
  const owner = await getUserForFilter(matchGroupConfig.ownerId);
  let members: UserForFilter[] = [owner];
  const startTime = Date.now();
  while (members.length < matchGroupConfig.numOfMembers) {
    // デフォルトは50秒でタイムアウト
    if (Date.now() - startTime > (!timeout ? 50000 : timeout)) {
      console.error("not all members found before timeout");
      return;
    }
    const candidate = await getUserForFilter();
    if (!isCandidateValid(matchGroupConfig, owner, candidate, members)) {
      continue;
    }
    members = members.concat(candidate);
    console.log(`${candidate.userId} is added to members`);
  }

  const matchGroupId = uuidv4();
  await insertMatchGroup({
    matchGroupId,
    matchGroupName: matchGroupConfig.matchGroupName,
    description: matchGroupConfig.description,
    members,
    status: "open",
    createdBy: matchGroupConfig.ownerId,
    createdAt: new Date(),
  });

  return await getMatchGroupDetailByMatchGroupId(matchGroupId);
};

const isCandidateValid = async (
  matchGroupConfig: MatchGroupConfig,
  owner: UserForFilter,
  candidate: UserForFilter,
  members: UserForFilter[]
): boolean => {
  if (
    matchGroupConfig.departmentFilter !== "none" &&
    !isPassedDepartmentFilter(
      matchGroupConfig.departmentFilter,
      owner.departmentName,
      candidate.departmentName
    )
  ) {
    console.log(`${candidate.userId} is not passed department filter`);
    return false;
  }

  if (
    matchGroupConfig.officeFilter !== "none" &&
    !isPassedOfficeFilter(
      matchGroupConfig.officeFilter,
      owner.officeName,
      candidate.officeName
    )
  ) {
    console.log(`${candidate.userId} is not passed office filter`);
    return false;
  }

  if (
    matchGroupConfig.skillFilter.length > 0 &&
    !isPassedSkillFilter(matchGroupConfig.skillFilter, candidate.skillNames)
  ) {
    console.log(`${candidate.userId} is not passed skill filter`);
    return false;
  }

  if (
    matchGroupConfig.neverMatchedFilter &&
    !(await isPassedMatchFilter(matchGroupConfig.ownerId, candidate.userId))
  ) {
    console.log(`${candidate.userId} is not passed never matched filter`);
    return false;
  }

  if (members.some((member) => member.userId === candidate.userId)) {
    console.log(`${candidate.userId} is already added to members`);
    return false;
  }

  return true;
};

const isPassedDepartmentFilter = (
  departmentFilter: string,
  ownerDepartment: string,
  candidateDepartment: string
): boolean => {
  return departmentFilter === "onlyMyDepartment"
    ? ownerDepartment === candidateDepartment
    : ownerDepartment !== candidateDepartment;
};

const isPassedOfficeFilter = (
  officeFilter: string,
  ownerOffice: string,
  candidateOffice: string
): boolean => {
  return officeFilter === "onlyMyOffice"
    ? ownerOffice === candidateOffice
    : ownerOffice !== candidateOffice;
};

const isPassedSkillFilter = (
  skillFilter: string[],
  candidateSkills: string[]
): boolean => {
  const candidateSkillsSet = new Set(candidateSkills);
  return skillFilter.some((skill) => candidateSkillsSet.has(skill));
};

const isPassedMatchFilter = async (
  ownerId: string,
  candidateId: string
): Promise<boolean> => {
  const userIdsBeforeMatched = await getUserIdsBeforeMatched(ownerId);
  return !userIdsBeforeMatched.includes(candidateId);
};

