import { Type } from '@fastify/type-provider-typebox';
import {
    GraphQLBoolean,
    GraphQLFloat,
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
        title: {type: new GraphQLNonNull(GraphQLString)},
        content: {type: new GraphQLNonNull(GraphQLString)},
        authorId: {type: new GraphQLNonNull(GraphQLString)}
    }),
})


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        balance: {type: new GraphQLNonNull(GraphQLFloat)},
        profile: {
            type: ProfileType,
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
            resolve: async (user, _args, prisma) => {
                return await prisma.post.findMany({
                    where: {
                        authorId: user.id,
                    },
                })
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

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    description: 'Root query',
    fields: () => ({
        memberTypes: {
            type: new GraphQLList(MemberType),
            description: 'List of members',
            async resolve(_obj, args, prisma, info) {
                return await prisma.memberType.findMany();
            }
        },
        memberType: {
            type: MemberType,
            description: 'A single member',
            args: {
                id: { type: new GraphQLNonNull(MemberTypeIdType)}
            },
            async resolve(_obj, args, prisma, info) {
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
            async resolve(_obj, args, prisma, info) {
                return await prisma.post.findMany();
            }
        },
        post: {
            type: PostType,
            description: 'A single post',
            args: {
                id: { type: new GraphQLNonNull(UUIDType)}
            },
            async resolve(_obj, args, prisma, info) {
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
            async resolve(_obj, args, prisma, info) {
                return await prisma.user.findMany();
            }
        },
        user: {
            type: UserType,
            description: 'A single user',
            args: {
                id: { type: new GraphQLNonNull(UUIDType)}
            },
            async resolve(_obj, args, prisma, info) {
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
            async resolve(_obj, args, prisma, info) {
                return await prisma.profile.findMany();
            }
        },
        profile: {
            type: ProfileType,
            description: 'A single profile',
            args: {
                id: { type: new GraphQLNonNull(UUIDType)}
            },
            async resolve(_obj, args, prisma, info) {
                return await prisma.profile.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
    }),

})

export const schema = new GraphQLSchema({
    query: RootQueryType
})
