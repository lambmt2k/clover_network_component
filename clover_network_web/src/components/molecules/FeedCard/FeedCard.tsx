import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Modal } from 'antd'
import { GoCommentDiscussion } from 'react-icons/go'
import { PiShareFat } from 'react-icons/pi'
import { IoMdSend } from 'react-icons/io'

import { listAudienceGroup } from '@/utils/data'
import images from '@/assets/images'
import {
  useGetFeedDetail,
  useGetFeedLink,
  useGetFetchQuery,
  useGetUserLike,
  usePostComment,
  usePostLike,
} from '@/hook'
import { CloverLikeIcon, CloverOutlineIcon } from '@/components/atoms/Icons'
import Button from '@/components/atoms/Button'
import FeedCardDetail from './FeedCardDetail'
import TimeAgo from '../TimeAgo'

interface iProps {
  data: FeedGroupData
  innerRef?: React.Ref<HTMLParagraphElement>
}

const FeedCard = ({ data, innerRef }: iProps) => {
  const queryClient = useQueryClient()
  const getUserInfo = useGetFetchQuery<ResponseUserType>(['UserInfo'])

  const [photoView, setPhotoView] = useState<string>('')
  const [openModalComment, setOpenModalComment] = useState<boolean>(false)

  const getFeedDetailApi = useGetFeedDetail()

  const getFeedLinkApi = useGetFeedLink()

  const commentApi = usePostComment()

  const checkLikeApi = useGetUserLike()

  const [isLike, setIsLike] = useState<string | null>(data.currentUserReact!)

  const [totalLike, setTotalLike] = useState<number>(data.totalReact)

  const likeApi = usePostLike()

  const formComment = useForm<FeedCommentType>({
    defaultValues: {
      postId: data.feedItem.postId,
      authorId: getUserInfo?.data.userId,
      content: '',
      level: 0,
    },
  })

  const handleCopyLink = () => {
    getFeedLinkApi.mutate(data.feedItem.postId, {
      onSuccess(data) {
        navigator.clipboard
          .writeText(data.data.data)
          .then(() => {
            toast.success('Copy path successfully!')
          })
          .catch(() => {
            console.error('Copy path failed!')
          })
      },
    })
  }

  const handleGetFeedDetail = () => {
    getFeedDetailApi.mutate(data.feedItem.postId, {
      onSuccess() {
        setOpenModalComment(true)
      },
    })
  }

  const handleComment = (value: FeedCommentType) => {
    commentApi.mutate(value, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['ListComment'] })
        formComment.reset()
      },
    })
  }

  const handleReactFeed = () => {
    checkLikeApi.mutate(data.feedItem.postId, {
      onSuccess(dataFeed) {
        if (dataFeed.data.data.currentUserLike) {
          setIsLike(null)
          likeApi.mutate(
            {
              postId: data.feedItem.postId,
              reactType: 'LIKE',
              status: 0,
            },
            {
              onSuccess(dataLike) {
                setTotalLike(dataLike.data.data)
              },
            },
          )
        } else {
          setIsLike('LIKE')
          likeApi.mutate(
            {
              postId: data.feedItem.postId,
              reactType: 'LIKE',
              status: 1,
            },
            {
              onSuccess(dataLike) {
                setTotalLike(dataLike.data.data)
              },
            },
          )
        }
      },
    })
  }

  return (
    <Fragment>
      <div
        className='mt-4 w-full rounded-lg border bg-white p-3'
        ref={innerRef}
      >
        <div className='flex items-center gap-3'>
          <Button to={`/profile/${data.authorProfile.userId}`}>
            <figure className='h-[40px] w-[40px] overflow-hidden rounded-full hover:cursor-pointer'>
              <img
                src={data.authorProfile.avatarImgUrl || images.avatar}
                alt='avatar'
              />
            </figure>
          </Button>
          <div>
            <Button
              to={`/profile/${data.authorProfile.userId}`}
              className='text-textHeadingColor'
            >
              {data.authorProfile.displayName}
            </Button>
            <h1 className='flex items-center gap-2 text-sm text-textPrimaryColor'>
              <TimeAgo timestamp={data.feedItem.createdTime} />
              {listAudienceGroup.map(
                (it) =>
                  it.value === data.feedItem.privacyType && (
                    <div className='flex items-center gap-2' key={it.key}>
                      <span className=''>
                        <it.icon />
                      </span>
                    </div>
                  ),
              )}
            </h1>
          </div>
        </div>
        <p className='mt-3 text-sm text-textPrimaryColor'>
          {data.feedItem.content}
        </p>
        <div className='mt-3 grid gap-2'>
          {data.feedItem.feedImages &&
            (data.feedItem.feedImages.length === 1 ? (
              <figure
                onClick={() => setPhotoView(data.feedItem.feedImages![0])}
                className='h-auto max-h-[600px] w-full cursor-pointer overflow-hidden rounded-md border'
              >
                <img
                  className='h-full w-full cursor-pointer object-contain'
                  src={data.feedItem.feedImages[0]}
                  alt='photo'
                />
              </figure>
            ) : data.feedItem.feedImages?.length === 2 ? (
              <div className='grid grid-cols-2 gap-2'>
                {data.feedItem.feedImages?.map((it, i) => (
                  <figure
                    onClick={() => setPhotoView(it)}
                    key={i}
                    className='h-48 w-full cursor-pointer overflow-hidden rounded-md border'
                  >
                    <img
                      className='h-full w-full cursor-pointer object-contain'
                      src={it}
                      alt='photo'
                    />
                  </figure>
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-2'>
                <figure
                  onClick={() => setPhotoView(data.feedItem.feedImages![0])}
                  className='h-auto max-h-[600px] w-full cursor-pointer overflow-hidden rounded-md border'
                >
                  <img
                    className='h-full w-full cursor-pointer object-contain'
                    src={data.feedItem.feedImages[0]}
                    alt='photo'
                  />
                </figure>
                <div className='grid grid-cols-2 gap-2'>
                  {data.feedItem.feedImages?.slice(1).map((it, i) => (
                    <figure
                      onClick={() => setPhotoView(it)}
                      key={i}
                      className='h-48 w-full cursor-pointer overflow-hidden rounded-md border'
                    >
                      <img
                        className='h-full w-full cursor-pointer object-contain'
                        src={it}
                        alt='photo'
                      />
                    </figure>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <div className='my-3 flex items-center'>
          <span className='h-px w-full bg-secondColor opacity-30'></span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <span className=' text-textPrimaryColor'>
              <CloverOutlineIcon height='20px' width='20px' />
            </span>
            <p className='text-sm text-textPrimaryColor'>{totalLike}</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-textPrimaryColor'>
              {data.totalComment} comments
            </p>
          </div>
        </div>
        <div className='my-3 flex items-center'>
          <span className='h-px w-full bg-secondColor opacity-30'></span>
        </div>
        <div className='grid grid-cols-3'>
          <div
            className='flex cursor-pointer items-center justify-center gap-2 px-3 py-1 hover:bg-primaryColor/10'
            onClick={handleReactFeed}
          >
            <span className='text-2xl text-textPrimaryColor'>
              {!isLike ? (
                <CloverOutlineIcon height='28px' width='28px' />
              ) : (
                <CloverLikeIcon height='28px' width='28px' />
              )}
            </span>
            <p
              className={`font-medium ${
                isLike ? 'text-primaryColor' : 'text-textPrimaryColor'
              }`}
            >
              Like
            </p>
          </div>
          <div
            className='flex cursor-pointer items-center justify-center gap-2 px-3 py-1 hover:bg-primaryColor/10'
            onClick={handleGetFeedDetail}
          >
            <span className='text-2xl text-textPrimaryColor'>
              <GoCommentDiscussion />
            </span>
            <p className='font-medium text-textPrimaryColor'>Comment</p>
          </div>
          <div
            className='flex cursor-pointer items-center justify-center gap-2 px-3 py-1 hover:bg-primaryColor/10'
            onClick={handleCopyLink}
          >
            <span className='text-2xl text-textPrimaryColor'>
              <PiShareFat />
            </span>
            <p className='font-medium text-textPrimaryColor'>Share</p>
          </div>
        </div>
      </div>
      <Modal
        title={<h1 className='text-xl text-textHeadingColor'>Photo</h1>}
        open={!!photoView}
        onCancel={() => setPhotoView('')}
        footer={null}
        width='60%'
      >
        <figure className='h-auto max-h-[600px] w-full cursor-pointer overflow-hidden rounded-md border'>
          <img
            className='h-full w-full cursor-pointer object-contain'
            src={photoView}
            alt='photo'
          />
        </figure>
      </Modal>
      <Modal
        open={openModalComment}
        onCancel={() => setOpenModalComment(false)}
        footer={
          <div className='flex items-center gap-3'>
            <figure className='h-[40px] w-[40px] overflow-hidden rounded-full hover:cursor-pointer'>
              <img
                src={getUserInfo?.data.avatar || images.avatar}
                alt='avatar'
              />
            </figure>
            <div className='flex flex-1 items-center rounded-full bg-bgPrimaryColor px-3 text-left text-sm text-textPrimaryColor outline-none hover:bg-primaryColor/10'>
              <input
                {...formComment.register('content')}
                className='h-full w-full bg-transparent py-3 outline-none'
                placeholder='Write a comment...'
              />
              <span
                className='cursor-pointer text-xl text-primaryColor'
                onClick={formComment.handleSubmit(handleComment)}
              >
                <IoMdSend />
              </span>
            </div>
          </div>
        }
      >
        <FeedCardDetail
          isLike={isLike}
          setIsLike={setIsLike}
          totalLike={totalLike}
          setTotalLike={setTotalLike}
          data={getFeedDetailApi.data?.data.data!}
        />
      </Modal>
    </Fragment>
  )
}

export default FeedCard
