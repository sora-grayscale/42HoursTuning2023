import { Target, SearchedUser } from "../../model/types";
import {
  getUsersByUserName,
  getUsersByKana,
  getUsersByMail,
  getUsersByDepartmentName,
  getUsersByRoleName,
  getUsersByOfficeName,
  getUsersBySkillName,
  getUsersByGoal,
} from "./repository";

export const getUsersByKeyword = async (
  keyword: string,
  targets: Target[]
): Promise<SearchedUser[]> => {
  const searchPromises: Promise<SearchedUser[]>[] = [];

  for (const target of targets) {
    switch (target) {
      case "userName":
        searchPromises.push(getUsersByUserName(keyword));
        break;
      case "kana":
        searchPromises.push(getUsersByKana(keyword));
        break;
      case "mail":
        searchPromises.push(getUsersByMail(keyword));
        break;
      case "department":
        searchPromises.push(getUsersByDepartmentName(keyword));
        break;
      case "role":
        searchPromises.push(getUsersByRoleName(keyword));
        break;
      case "office":
        searchPromises.push(getUsersByOfficeName(keyword));
        break;
      case "skill":
        searchPromises.push(getUsersBySkillName(keyword));
        break;
      case "goal":
        searchPromises.push(getUsersByGoal(keyword));
        break;
    }
  }

  const results = await Promise.all(searchPromises);
  const users = results.reduce((acc, cur) => acc.concat(cur), []);
  
  return users;
};

