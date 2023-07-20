import { Type } from '@fastify/type-provider-typebox';
import {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} from 'graphql';

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

const MemberType = new GraphQLObjectType({
    name: 'Member',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        discount: {type: new GraphQLNonNull(GraphQLFloat)},
        postsLimitPerMonth: {type: new GraphQLNonNull(GraphQLInt)},
    }),
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        title: {type: GraphQLString},
        content: {type: GraphQLString},
        authorId: {type: new GraphQLNonNull(GraphQLString)}
    }),
})


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        balance: {type: new GraphQLNonNull(GraphQLFloat)}
    }),
})

const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        isMale: {type: new GraphQLNonNull(GraphQLBoolean)},
        yearOfBirth: {type: new GraphQLNonNull(GraphQLInt)},
    }),
})

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    description: 'Root query',
    fields: () => ({
        memberTypes: {
            type: new GraphQLList(MemberType),
            description: 'List of members',
            async resolve(obj, args, prisma, info) {
                return prisma.memberType.findMany();
            }
        },
        memberType: {
            type: MemberType,
            description: 'A single member',
            args: {
                id: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(obj, args, prisma, info) {
                return prisma.memberType.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            description: 'List of posts',
            async resolve(obj, args, prisma, info) {
                return prisma.post.findMany();
            }
        },
        users: {
            type: new GraphQLList(UserType),
            description: 'List of users',
            async resolve(obj, args, prisma, info) {
                return prisma.user.findMany();
            }
        },
        profiles: {
            type: new GraphQLList(ProfileType),
            description: 'List of profiles',
            async resolve(obj, args, prisma, info) {
                return prisma.profile.findMany();
            }
        }
    }),

})

export const schema = new GraphQLSchema({
    query: RootQueryType
})
