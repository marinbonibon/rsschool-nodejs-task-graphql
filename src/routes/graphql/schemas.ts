import { Type } from '@fastify/type-provider-typebox';
import {
    GraphQLBoolean,
    GraphQLFloat, GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType, GraphQLScalarType,
    GraphQLSchema,
    Kind
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
    })
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        title: {type: new GraphQLNonNull(UUIDType)},
        content: {type: new GraphQLNonNull(UUIDType)},
        authorId: {type: new GraphQLNonNull(UUIDType)}
    })
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
    })
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
    })
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
    })
})

const CreatePostInputTypes = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
        title: {type: new GraphQLNonNull(UUIDType)},
        content: {type: new GraphQLNonNull(UUIDType)},
        authorId: {type: new GraphQLNonNull(UUIDType)},
    })
});

const ChangePostInputTypes = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: () => ({
        title: {type: UUIDType},
        content: {type: UUIDType},
    })
});

const CreateUserInputTypes = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
        name: {type: new GraphQLNonNull(UUIDType)},
        balance: {type: new GraphQLNonNull(GraphQLFloat)},
    })
});

const ChangeUserInputTypes = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
        name: {type: UUIDType},
        balance: {type: GraphQLFloat},
    })
});

const CreateProfileInputTypes = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
        userId: {type: new GraphQLNonNull(UUIDType)},
        memberTypeId: {type: new GraphQLNonNull(MemberTypeIdType)},
        isMale: {type: new GraphQLNonNull(GraphQLBoolean)},
        yearOfBirth: {type: new GraphQLNonNull(GraphQLInt)},
    })
});

const ChangeProfileInputTypes = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
        memberTypeId: {type: MemberTypeIdType},
        isMale: {type: GraphQLBoolean},
        yearOfBirth: {type: GraphQLInt},
    })
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    description: 'Root mutation',
    fields: () => ({
        createPost: {
            type: PostType,
            description: 'Creates a post',
            args: {
                dto: {
                    type: new GraphQLNonNull(CreatePostInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const data = {...args.dto};
                return await prisma.post.create({
                    data
                });
            },
        },
        createUser: {
            type: UserType,
            description: 'Creates a user',
            args: {
                dto: {
                    type: new GraphQLNonNull(CreateUserInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const data = {...args.dto};
                return await prisma.user.create({
                    data
                });
            },
        },
        createProfile: {
            type: ProfileType,
            description: 'Creates a profile',
            args: {
                dto: {
                    type: new GraphQLNonNull(CreateProfileInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const data = {...args.dto};
                return await prisma.profile.create({
                    data
                });
            },
        },
        changePost: {
            type: PostType,
            description: 'Changes a post',
            args: {
                id: {
                    type: new GraphQLNonNull(UUIDType)
                },
                dto: {
                    type: new GraphQLNonNull(ChangePostInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const data = {...args.dto};
                return await prisma.post.update({
                    where: { id: args.id },
                    data,
                });
            },
        },
        changeUser: {
            type: UserType,
            description: 'Changes a data of a user',
            args: {
                id: {
                    type: new GraphQLNonNull(UUIDType)
                },
                dto: {
                    type: new GraphQLNonNull(ChangeUserInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const data = {...args.dto};
                return await prisma.user.update({
                    where: { id: args.id },
                    data,
                });
            },
        },
        changeProfile: {
            type: ProfileType,
            description: 'Changes a data of a profile',
            args: {
                id: {
                    type: new GraphQLNonNull(UUIDType)
                },
                dto: {
                    type: new GraphQLNonNull(ChangeProfileInputTypes)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const data = {...args.dto};
                return await prisma.profile.update({
                    where: { id: args.id },
                    data,
                });
            },
        },
        subscribeTo: {
            type: UserType,
            description: 'Subscribes to user',
            args: {
                userId: {
                    type: new GraphQLNonNull(UUIDType)
                },
                authorId: {
                    type: new GraphQLNonNull(UUIDType)
                }
            },
            resolve: async (_obj, args, prisma) => {
                const { userId, authorId } = args;
                return await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        userSubscribedTo: {
                            create: {
                                authorId,
                            },
                        },
                    },
                })
            }
        },
    })
})

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
})
