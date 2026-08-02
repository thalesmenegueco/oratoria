'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import type { Speech } from '../types/database'
import { deleteSpeechAction } from '../actions/speech.actions'
import ConfirmDialog from './ConfirmDialog'

type SpeechCardProps = {
  speech: Speech
}

export default function SpeechCard({ speech }: SpeechCardProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSpeechAction(speech.id)
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
      router.refresh()
    }
  }

  return (
    <div className="group/card w-full flex flex-col gap-4">
      <Link
        href={`/present/${speech.id}`}
        className="block group no-underline mx-4"
      >
        <div className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-6 h-full transition-all duration-300 hover:border-[#ac61b9] hover:shadow-[0_0_20px_rgba(172,97,185,0.25)] hover:scale-[1.02] pb-8">
          <h2 className="text-[#e36ff7] text-2xl font-bold text-white mb-2 font-atkinson group-hover:text-[#d564e8] transition-colors">
            {speech.title}
          </h2>
          <p className="text-sm text-[#b7c1de]/70 mb-4 line-clamp-2">
            {speech.description || 'Sem descrição.'}
          </p>

          <div className="flex gap-7">
            <div className="text-xs font-semibold px-3 py-1 bg-[#63345e] text-white w-fit rounded-full">
              {speech.type === 'SPEECH' ? 'DISCURSO' : 'COMENTÁRIO'}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowConfirm(true)
              }}
              className="z-10 text-[#b7c1de]/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
              title="Apagar discurso"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

      </Link>



      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Apagar Discurso"
        message={`Tem a certeza que deseja apagar **${speech.title}**? Esta ação é irreversível.`}
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  )
}
