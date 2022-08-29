package com.kyonggi.hearing.presentation.main.info

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.kyonggi.hearing.databinding.DetailInfoLayoutBinding

data class Info(
    var title: String,
    var detail: String,
    var imageResource: Int
)
class InfoAdapter(private val list: List<Info>): RecyclerView.Adapter<InfoAdapter.InfoViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InfoViewHolder {
        val binding = DetailInfoLayoutBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return InfoViewHolder(binding)
    }

    override fun onBindViewHolder(holder: InfoViewHolder, position: Int) {
        holder.bind(list[position])
    }

    override fun getItemCount(): Int = list.size
    // Info ViewHolder
    inner class InfoViewHolder(private val binding: DetailInfoLayoutBinding) :
        RecyclerView.ViewHolder(binding.root) {
        // 앱 설명 Info data 바인딩
        fun bind(info: Info) {
            with(binding) {
                infoTitleText.text = info.title
                infoDetailText.text = info.detail
                infoImage.setImageResource(info.imageResource)
            }
        }
    }
}