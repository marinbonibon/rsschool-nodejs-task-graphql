import { Type } from '@fastify/type-provider-typebox';
import {
    GraphQLBoolean,
    GraphQLFloat, GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType, GraphQLScalarType,
    GraphQLSchema,
    GraphQLString, Kind
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

export const gqlResponseSchema = Type.Partial(
    Type.Object({
        data: Type.Any(),
        errors: Type.Any(),
    }),
);

export const createGqlResponseSchema = {
    body: Type.Object(
        {
            query: Type.String(),
            variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
        },
        {
            additionalProperties: false,
        },
    ),
};

const MemberTypeIdType = new GraphQLScalarType({
    name: 'MemberTypeId',
    description: 'Custom scalar type for MemberTypeId enum',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return ast.value as MemberTypeId;
        }
        return null;
    },
});
const MemberType = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
        id: {type: new GraphQLNonNull(MemberTypeIdType)},
        discount: {type: new GraphQLNonNull(GraphQLFloat)},
        postsLimitPerMonth: {type: new GraphQLNonNull(GraphQLInt)},
    }),
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        title: {type: new GraphQLNonNull(UUIDType)},
        content: {type: new GraphQLNonNull(UUIDType)},
        authorId: {type: new GraphQLNonNull(UUIDType)}
    }),
})


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        name: {type: new GraphQLNonNull(UUIDType)},
        balance: {type: new GraphQLNonNull(GraphQLFloat)},
        profile: {
            type: ProfileType,
            description: 'Profile of user',
            resolve: async (user, _args, prisma, info) => {
                return await prisma.profile.findUnique({
                    where: {
                        userId: user.id,
                    },
                })
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            description: 'All posts of user',
            resolve: async (user, _args, prisma) => {
                return await prisma.post.findMany({
                    where: {
                        authorId: user.id,
                    },
                })
            }

        },
        userSubscribedTo: {
            type: new GraphQLList(UserType),
            description: 'Users, to whom user is subscribed',
            resolve: async (user, _args, prisma) => {
                return await prisma.user.findMany({
                    where: {
                        subscribedToUser: {
                            some: {
                                subscriberId: user.id,
                            },
                        },
                    },
                });
            }
        },
        subscribedToUser: {
            type: new GraphQLList(UserType),
            description: 'Users, who are subscribed to user',
            resolve: async (user, _args, prisma) => {
                return await prisma.user.findMany({
                    where: {
                        userSubscribedTo: {
                            some: {
                                authorId: user.id,
                            },
                        },
                    },
                });
            }
        }
    }),
})

const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        isMale: {type: new GraphQLNonNull(GraphQLBoolean)},
        yearOfBirth: {type: new GraphQLNonNull(GraphQLInt)},
        memberType: {
            type: MemberType,
            description: 'Member type of profile',
            resolve: async (profile, _args, prisma) => {
                return await prisma.memberType.findUnique({
                    where: {
                        id: profile.memberTypeId,
                    },
                });
            }
        }
    }),
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root query',
    fields: () => ({
        memberTypes: {
            type: new GraphQLList(MemberType),
            description: 'List of members',
            resolve: async (_obj, args, prisma) => {
                return await prisma.memberType.findMany();
            }
        },
        memberType: {
            type: MemberType,
            description: 'A single member',
            args: {
                id: {type: new GraphQLNonNull(MemberTypeIdType)}
            },
            resolve: async (_obj, args, prisma) => {
                return await prisma.memberType.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            description: 'List of posts',
            resolve: async (_obj, args, prisma) => {
                return await prisma.post.findMany();
            }
        },
        post: {
            type: PostType,
            description: 'A single post',
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (_obj, args, prisma) => {
                return await prisma.post.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        users: {
            type: new GraphQLList(UserType),
            description: 'List of users',
            resolve: async (_obj, args, prisma) => {
                return await prisma.user.findMany();
            }
        },
        user: {
            type: UserType,
            description: 'A single user',
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (_obj, args, prisma) => {
                return await prisma.user.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        profiles: {
            type: new GraphQLList(ProfileType),
            description: 'List of profiles',
            resolve: async (_obj, args, prisma) => {
                return await prisma.profile.findMany();
            }
        },
        profile: {
            type: ProfileType,
            description: 'A single profile',
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (_obj, args, prisma) => {
                return await prisma.profile.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
    }),

})

const CreatePostInputTypes = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: {
        title: { type: new GraphQLNonNull(UUIDType) },
        content: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
    }
});

const CreateUserInputTypes = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: {
        name: { type: new GraphQLNonNull(UUIDType) },
        balance: {type: new GraphQLNonNull(GraphQLFloat)},
    }
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    description: 'Root mutation',
    fields: {
        createPost: {
            type: PostType,
            args: {
                dto: {
                    type: new GraphQLNonNull(CreatePostInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                try {
                    const data = { ...args.dto };
                    return await prisma.post.create({
                        data
                    });
                } catch (error) {
                    console.log('error', error);
                }
            },
        },
        createUser: {
            type: UserType,
            args: {
                dto: {
                    type: new GraphQLNonNull(CreateUserInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
               try {
                   const data = { ...args.dto };
                   return await prisma.user.create({
                       data
                   });
               } catch (error) {
                   console.log('error', error);
               }
            },
        },
    }
})

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
})
