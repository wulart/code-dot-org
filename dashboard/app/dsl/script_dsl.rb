class ScriptDSL < BaseDSL
  def initialize
    super
    @id = nil
    @stage = nil
    @stage_flex_category = nil
    @stage_lockable = false
    @concepts = []
    @skin = nil
    @current_scriptlevel = nil
    @scriptlevels = []
    @stages = []
    @i18n_strings = Hash.new({})
    @video_key_for_next_level = nil
    @prompt = nil
    @hidden = true
    @login_required = false
    @hideable_stages = false
    @wrapup_video = nil
  end

  integer :id
  string :professional_learning_course
  integer :peer_reviews_to_complete

  boolean :hidden
  boolean :login_required
  boolean :hideable_stages

  string :wrapup_video

  def stage(name, properties = {})
    @stages << {stage: @stage, scriptlevels: @scriptlevels} if @stage
    @stage = name
    @stage_flex_category = properties[:flex_category]
    @stage_lockable = properties[:lockable]
    @scriptlevels = []
    @concepts = []
    @skin = nil
  end

  def parse_output
    stage(nil)
    {
      id: @id,
      stages: @stages,
      hidden: @hidden,
      wrapup_video: @wrapup_video,
      login_required: @login_required,
      hideable_stages: @hideable_stages,
      professional_learning_course: @professional_learning_course,
      peer_reviews_to_complete: @peer_reviews_to_complete
    }
  end

  def concepts(*items)
    @concepts = items
  end

  def level_concept_difficulty(json)
    @level_concept_difficulty = json ? JSON.parse(json) : {}
  end

  string :skin

  string :video_key_for_next_level

  string :prompt

  def assessment(name, properties = {})
    properties[:assessment] = true
    level(name, properties)
  end

  def named_level(name)
    level(name, {named_level: true})
  end

  def level(name, properties = {})
    active = properties.delete(:active)
    buttontext = properties.delete(:buttontext)
    imageurl = properties.delete(:imageurl)
    level_description = properties.delete(:description)
    level = {
      :name => name,
      :stage_flex_category => @stage_flex_category,
      :stage_lockable => @stage_lockable,
      :skin => @skin,
      :concepts => @concepts.join(','),
      :level_concept_difficulty => @level_concept_difficulty || {},
      :video_key => @video_key_for_next_level
    }.merge(properties).select{|_, v| v.present? }
    @video_key_for_next_level = nil
    if @current_scriptlevel
      @current_scriptlevel[:levels] << level

      levelprops = {}
      levelprops[:active] = active if active == false
      levelprops[:buttontext] = buttontext if buttontext
      levelprops[:imageurl] = imageurl if imageurl
      levelprops[:description] = level_description if level_description
      unless levelprops.empty?
        @current_scriptlevel[:properties][name] = levelprops
      end
    else
      @scriptlevels << {
        :stage => @stage,
        :levels => [level]
      }
    end
  end

  def variants
    @current_scriptlevel = { :levels => [], :properties => {}, :stage => @stage}
  end

  def endvariants
    @current_scriptlevel[:properties][:prompt] = @prompt if @prompt
    @scriptlevels << @current_scriptlevel

    @current_scriptlevel = nil
    @prompt = nil
  end

  def i18n_strings
    @i18n_strings['stage'] = {}
    @stages.each do |stage|
      @i18n_strings['stage'][stage[:stage]] = stage[:stage]
    end

    {'name' => {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.script'))
  end

  def self.serialize(script, filename)
    s = []

    s << "hidden: 'false'" unless script.hidden
    s << "login_required: 'true'" if script.login_required
    s << "hideable_stages: 'true'" if script.hideable_stages
    s << "wrapup_video: '#{wrapup_video}'" if script.wrapup_video

    s << "professional_learning_course: '#{script.professional_learning_course}'" if script.professional_learning_course
    s << "peer_reviews_to_complete: #{script.peer_reviews_to_complete}" if script.peer_reviews_to_complete

    s << '' unless s.empty?

    # TODO: stages

    File.write(filename, s.join("\n"))
  end
end
