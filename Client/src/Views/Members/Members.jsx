import React from 'react';
import useOrg from '../../Context/OrgContext';
import { GetRoleColor } from '../../utils/GetRoleColor';
import useUser from '../../Context/UserContext';

const Members = () => {

  const { orgData } = useOrg();
  const { user } = useUser();

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
    <div className='membersPage flex flex-col p-4 gap-3'>
      <div className='font-medium opacity-80'>{orgData ? `Organization - ${orgData.orgName}'s Members`: "Not any Organization selected"}</div>
      <div className="memebersGrid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {orgData?.members?.map((memberData) => {
          const { member, role, joinedAt, _id } = memberData;
          return (
            <div
              key={_id}
              className={`w-full rounded-md border shadow-md flex flex-col items-center px-2 pt-2 pb-1  ${GetRoleColor(role)}`}
            >
              <div className="w-full flex justify-start mb-2">
                <span className={`text-[10px] font-semibold px-1 py-0.5 rounded-md border ${GetRoleColor(role)}`}>
                  {role}
                </span>
              </div>
              <img  
                src={member?.profilePhoto}
                alt={member?.userName}
                className="h-14 w-14 rounded-full object-cover border border-zinc-500"
              />
              <div className="mt-2 text-center flex flex-col">
                <span className={`${user._id == member._id ? "text-blue-500":""} font-semibold text-sm`}> { user._id == member._id ? "YOU" : member?.userName}</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 break-all">{member?.email}</span>
              </div>
              <span className="mt-3 text-[9px] text-zinc-500 italic self-end font-medium">
                Joined • {formatDate(joinedAt)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
    </>
  );
};

export default Members;
